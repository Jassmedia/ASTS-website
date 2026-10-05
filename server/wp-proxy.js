/**
 * Same-domain reverse proxy from the front end to the WordPress backend.
 * Written against the standard Fetch API (Request/Response) so the exact same
 * code runs in the Vercel middleware / edge function and in the local Vite
 * dev and preview servers.
 *
 * Configuration (environment variables):
 *   WP_ORIGIN         where WordPress is reachable, e.g. https://cms.aststraining.com
 *                     (defaults to https://aststraining.com, the current live site)
 *   PUBLIC_ORIGIN     the public site address WordPress is configured with (home/siteurl),
 *                     default https://aststraining.com
 *   WP_PROXY_SECRET   optional shared secret sent as X-ASTS-Proxy-Secret; the WordPress
 *                     mu-plugin (wordpress/mu-plugins/asts-proxy.php) only trusts the
 *                     forwarded host/IP headers when it matches.
 */

const HOP_BY_HOP = ['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'te', 'trailer', 'host', 'content-length', 'accept-encoding'];
const TEXT_TYPES = /^(text\/|application\/(json|javascript|xml|rss\+xml|atom\+xml|xhtml\+xml|ld\+json)|image\/svg\+xml)/i;

export function wpConfig(env = {}) {
  const wpOrigin = (env.WP_ORIGIN || 'https://aststraining.com').replace(/\/+$/, '');
  const publicOrigin = (env.PUBLIC_ORIGIN || 'https://aststraining.com').replace(/\/+$/, '');
  return { wpOrigin, publicOrigin, secret: env.WP_PROXY_SECRET || '' };
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Builds a function that rewrites absolute URLs of `fromOrigins` to `toOrigin`
 * in plain, JSON-escaped (https:\/\/…), URL-encoded (https%3A%2F%2F…) and
 * protocol-relative (//host) forms.
 */
function makeRewriter(fromOrigins, toOrigin) {
  const to = new URL(toOrigin);
  const pairs = [];
  for (const origin of fromOrigins) {
    const from = new URL(origin);
    if (from.origin === to.origin) continue;
    const variants = [
      [from.origin, to.origin],
      [from.origin.replace(/\//g, '\\/'), to.origin.replace(/\//g, '\\/')],
      [encodeURIComponent(from.origin), encodeURIComponent(to.origin)],
    ];
    for (const [a, b] of variants) pairs.push([new RegExp(escapeRe(a), 'g'), b]);
    // protocol-relative references: //host/... (not preceded by a scheme colon or a letter)
    pairs.push([new RegExp('(^|[^:\\w])//' + escapeRe(from.host) + '(?=[/"\'\\s?#]|$)', 'g'), '$1//' + to.host]);
  }
  if (!pairs.length) return null;
  return (text) => pairs.reduce((t, [re, rep]) => t.replace(re, rep), text);
}

/**
 * The canonical URL of a WordPress-rendered page stays on the public origin whatever host the
 * visitor used: a staging or preview address must never be named as the canonical version.
 */
function keepCanonical(html, requestOrigin, publicOrigin) {
  if (requestOrigin === publicOrigin) return html;
  const toPublic = (tag) => tag.split(requestOrigin).join(publicOrigin);
  return html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, toPublic).replace(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*>/gi, toPublic);
}

/**
 * Forwards `request` to WordPress and returns WordPress' response, adapted for
 * the host the visitor used. Returns null when WordPress cannot be reached so
 * the caller can fall back to the static site.
 */
export async function proxyToWordPress(request, env = {}) {
  const { wpOrigin, publicOrigin, secret } = wpConfig(env);
  const incoming = new URL(request.url);
  const requestOrigin = incoming.origin;
  const target = new URL(incoming.pathname + incoming.search, wpOrigin);

  const headers = new Headers();
  for (const [k, v] of request.headers) {
    if (!HOP_BY_HOP.includes(k.toLowerCase())) headers.set(k, v);
  }
  // WordPress must see the public host (it is configured for https://aststraining.com).
  const publicUrl = new URL(publicOrigin);
  headers.set('x-forwarded-host', publicUrl.host);
  headers.set('x-forwarded-proto', publicUrl.protocol.replace(':', ''));
  const clientIp = request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  if (clientIp) headers.set('x-forwarded-for', clientIp);
  if (secret) headers.set('x-asts-proxy-secret', secret);
  // Same-site Origin/Referer as WordPress would see them on the public domain.
  for (const h of ['origin', 'referer']) {
    const v = headers.get(h);
    if (v && v.startsWith(requestOrigin)) headers.set(h, publicOrigin + v.slice(requestOrigin.length));
  }

  const init = { method: request.method, headers, redirect: 'manual' };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
    init.duplex = 'half';
  }

  let upstream;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    console.error('[wp-proxy] WordPress unreachable:', target.href, err && err.message);
    return null;
  }

  // Everything WordPress prints uses the public origin (and possibly its own
  // origin); map both to the address the visitor is using.
  const rewrite = makeRewriter([publicOrigin, wpOrigin], requestOrigin);
  const outHeaders = new Headers();
  for (const [k, v] of upstream.headers) {
    const key = k.toLowerCase();
    // fetch() already decoded the body; length/encoding no longer apply.
    if (key === 'content-encoding' || key === 'content-length' || key === 'transfer-encoding' || key === 'set-cookie') continue;
    outHeaders.set(k, key === 'location' && rewrite ? rewrite(v) : v);
  }
  const cookies = typeof upstream.headers.getSetCookie === 'function' ? upstream.headers.getSetCookie() : [upstream.headers.get('set-cookie')].filter(Boolean);
  for (const c of cookies) {
    // Bind cookies to the host the visitor is on (WordPress sets no Domain by default).
    outHeaders.append('set-cookie', c.replace(/;\s*domain=[^;]*/i, ''));
  }
  outHeaders.set('x-asts-backend', 'wordpress');

  const type = upstream.headers.get('content-type') || '';
  let body = upstream.body;
  if (rewrite && body && TEXT_TYPES.test(type)) {
    body = rewrite(await upstream.text());
    if (/^text\/html/i.test(type)) body = keepCanonical(body, requestOrigin, publicOrigin);
  }
  const noBody = request.method === 'HEAD' || [101, 204, 205, 304].includes(upstream.status);
  return new Response(noBody ? null : body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}
