/**
 * Vercel Routing Middleware (runs before the static files).
 *
 * 1. Old URLs of the WordPress site (root-level course URLs, attachment pages, tag archives,
 *    leftover pages; see src/lib/legacy-urls.js) answer with a 301 to their page on this site,
 *    or 410 when they have no equivalent.
 * 2. Requests that WordPress must answer (logged-in visitors, form/comment/enrol POSTs,
 *    wp-login/wp-admin/wp-json, LearnPress checkout and profiles, search, feeds, WordPress
 *    query URLs; see src/lib/wp-routing.js) are proxied to the WordPress backend (WP_ORIGIN).
 * Everything else continues to the prerendered site; unknown URLs get its 404 page.
 */
import { wordPressReason, WP_RENDER_HEADER } from './src/lib/wp-routing.js';
import { resolveLegacyUrl, GONE_HTML } from './src/lib/legacy-urls.js';
import { proxyToWordPress } from './server/wp-proxy.js';
import { NOINDEX_PAGES } from './src/data/retired-pages.mjs';

export const config = {
  // Build assets never need WordPress.
  matcher: ['/((?!assets/).*)'],
};

export default async function middleware(request) {
  const url = new URL(request.url);

  if (request.method === 'GET' || request.method === 'HEAD') {
    const legacy = resolveLegacyUrl(url.pathname);
    // The query string travels with the redirect (campaign parameters etc.).
    if (legacy && legacy.redirect) return Response.redirect(new URL(legacy.redirect + url.search, url), 301);
    if (legacy && legacy.gone) return new Response(request.method === 'HEAD' ? null : GONE_HTML, { status: 410, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' } });
  }

  const reason = wordPressReason({
    method: request.method,
    url,
    cookie: request.headers.get('cookie'),
    renderHeader: request.headers.get(WP_RENDER_HEADER),
  });
  if (!reason) return undefined; // continue to the static site
  const response = await proxyToWordPress(request, process.env);
  // Pages kept out of the index that WordPress renders (the empty LearnPress checkout).
  if (response && NOINDEX_PAGES.includes(url.pathname)) response.headers.set('x-robots-tag', 'noindex, follow');
  // WordPress unreachable: fall through to the static copy or the static 404 page.
  return response || undefined;
}
