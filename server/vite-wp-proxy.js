/**
 * Local equivalent of middleware.js + api/wp.js for `npm run dev` and
 * `npm run preview`: the same routing rules and the same proxy code, so login,
 * forms, comments, enrolment, reviews, search, feeds and sitemaps can be tested
 * on localhost against the WordPress backend (WP_ORIGIN, default the live site).
 */
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { wordPressReason, WP_RENDER_HEADER } from '../src/lib/wp-routing.js';
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

/**
 * @param {{ isStatic: (pathname: string) => boolean }} opts
 *   isStatic tells whether the front end serves a path (prerendered file or known route).
 */
function middleware(env, { isStatic }) {
  return async (req, res, next) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (VITE_INTERNAL.test(url.pathname)) return next();
      const reason =
        wordPressReason({ method: req.method, url, cookie: req.headers.cookie, renderHeader: req.headers[WP_RENDER_HEADER] }) ||
        (isStatic(url.pathname) ? null : 'not-prerendered');
      if (!reason) return next();
      const response = await proxyToWordPress(toRequest(req), env);
      if (!response) return next();
      await send(res, response);
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
      // Dev: the front end serves every prerendered route plus public/ files.
      const { listRoutes } = await import(path.resolve('scripts/routes-list.mjs'));
      const routes = new Set(listRoutes());
      const isStatic = (p) => {
        const withSlash = p.endsWith('/') ? p : p + '/';
        return routes.has(withSlash) || routes.has(p) || fileExists(path.join('public', decodeURIComponent(p))) || /^\/assets\//.test(p) || p === '/index.html';
      };
      server.middlewares.use(middleware(env, { isStatic }));
    },
    configurePreviewServer(server) {
      // Preview: the front end serves exactly what is in dist/.
      const dist = path.resolve(server.config.build.outDir || 'dist');
      const isStatic = (p) => {
        const rel = decodeURIComponent(p).replace(/^\/+/, '');
        return rel === '' || fileExists(path.join(dist, rel)) || fileExists(path.join(dist, rel, 'index.html'));
      };
      server.middlewares.use(middleware(env, { isStatic }));
    },
  };
}
