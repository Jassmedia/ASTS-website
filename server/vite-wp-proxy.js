/**
 * Local equivalent of the Vercel deployment for `npm run dev` and `npm run preview`:
 * the same old-URL rules (src/lib/legacy-urls.js), the same WordPress routing rules and proxy
 * code as middleware.js, and in preview also Vercel's static behaviour (trailing-slash redirect,
 * the 404 page for unknown URLs, the header rules of vercel.json). Login, forms, comments,
 * enrolment, reviews, search and feeds can so be tested on localhost against the WordPress
 * backend (WP_ORIGIN, default the live site), and redirects exactly as they will answer online.
 */
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { wordPressReason, WP_RENDER_HEADER } from '../src/lib/wp-routing.js';
import { resolveLegacyUrl, GONE_HTML } from '../src/lib/legacy-urls.js';
import { NOINDEX_PAGES } from '../src/data/retired-pages.mjs';
import { proxyToWordPress } from './wp-proxy.js';

const VITE_INTERNAL = /^\/(@vite|@react-refresh|@id|@fs|src\/|node_modules\/|__vite)/;

async function send(res, response) {
  res.statusCode = response.status;
  for (const [k, v] of response.headers) {
    if (k.toLowerCase() !== 'set-cookie') res.setHeader(k, v);
  }
  const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  if (cookies.length) res.setHeader('set-cookie', cookies);
  if (!response.body) return res.end();
  Readable.fromWeb(response.body).pipe(res);
}

function toRequest(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v !== undefined) headers.set(k, v);
  }
  const init = { method: req.method, headers };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = Readable.toWeb(req);
    init.duplex = 'half';
  }
  return new Request(url, init);
}

/** Header rules of vercel.json (only the forms this project uses: a path pattern, optionally a `has` host). */
function vercelHeaders() {
  let rules = [];
  try {
    rules = JSON.parse(fs.readFileSync('vercel.json', 'utf8')).headers || [];
  } catch {
    /* no vercel.json */
  }
  const compiled = rules.map((r) => ({
    source: new RegExp('^' + r.source + '$'),
    hosts: (r.has || []).filter((h) => h.type === 'host').map((h) => new RegExp('^' + h.value + '$')),
    headers: r.headers,
  }));
  return (req, res, pathname) => {
    const host = (req.headers.host || '').replace(/:\d+$/, '');
    for (const r of compiled) {
      if (!r.source.test(pathname) || !r.hosts.every((h) => h.test(host))) continue;
      for (const h of r.headers) res.setHeader(h.key, h.value);
    }
  };
}

/**
 * @param {{ isStatic: (pathname: string) => boolean, notFound?: string }} opts
 *   isStatic tells whether the front end serves a path; notFound is the 404 page file
 *   (preview only: unknown URLs answer 404 like the deployed site).
 */
function middleware(env, { isStatic, notFound }) {
  const applyHeaders = vercelHeaders();
  return async (req, res, next) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (VITE_INTERNAL.test(url.pathname)) return next();
      applyHeaders(req, res, url.pathname);

      if (req.method === 'GET' || req.method === 'HEAD') {
        const legacy = resolveLegacyUrl(url.pathname);
        if (legacy && legacy.redirect) {
          res.statusCode = 301;
          res.setHeader('location', legacy.redirect + url.search);
          return res.end();
        }
        if (legacy && legacy.gone) {
          res.statusCode = 410;
          res.setHeader('content-type', 'text/html; charset=utf-8');
          res.setHeader('x-robots-tag', 'noindex');
          return res.end(req.method === 'HEAD' ? undefined : GONE_HTML);
        }
      }

      const reason = wordPressReason({ method: req.method, url, cookie: req.headers.cookie, renderHeader: req.headers[WP_RENDER_HEADER] });
      if (reason) {
        const response = await proxyToWordPress(toRequest(req), env);
        if (response) {
          if (NOINDEX_PAGES.includes(url.pathname)) response.headers.set('x-robots-tag', 'noindex, follow');
          return await send(res, response);
        }
      }
      if (!notFound || isStatic(url.pathname)) return next();
      // Vercel (trailingSlash: true): /page -> 308 /page/
      if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname) && isStatic(url.pathname + '/')) {
        res.statusCode = 308;
        res.setHeader('location', url.pathname + '/' + url.search);
        return res.end();
      }
      res.statusCode = 404;
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(req.method === 'HEAD' ? undefined : fs.readFileSync(notFound));
    } catch (err) {
      next(err);
    }
  };
}

const fileExists = (f) => {
  try {
    return fs.statSync(f).isFile();
  } catch {
    return false;
  }
};

export default function wpProxyPlugin() {
  const env = process.env;
  return {
    name: 'asts-wp-proxy',
    async configureServer(server) {
      // Dev: Vite serves the app for every route; only old URLs and WordPress requests are handled here.
      server.middlewares.use(middleware(env, { isStatic: () => true }));
    },
    configurePreviewServer(server) {
      // Preview: the front end serves exactly what is in dist/.
      const dist = path.resolve(server.config.build.outDir || 'dist');
      const isStatic = (p) => {
        let rel;
        try {
          rel = decodeURIComponent(p).replace(/^\/+/, '');
        } catch {
          return false;
        }
        if (rel === '') return true;
        if (p.endsWith('/')) return fileExists(path.join(dist, rel, 'index.html'));
        return fileExists(path.join(dist, rel));
      };
      server.middlewares.use(middleware(env, { isStatic, notFound: path.join(dist, '404.html') }));
    },
  };
}
