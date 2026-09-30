/**
 * Vercel Routing Middleware (runs before the static files).
 *
 * Requests that WordPress must answer (logged-in visitors, form/comment/enrol
 * POSTs, wp-login/wp-admin/wp-json, LearnPress checkout, search, feeds, Yoast
 * sitemaps, WordPress query URLs; see src/lib/wp-routing.js) are proxied to the
 * WordPress backend on the same domain. Everything else continues to the
 * prerendered site. URLs that have no prerendered file are sent to WordPress by
 * the fallback rewrite in vercel.json (api/wp.js), exactly as the live site
 * would answer them.
 */
import { wordPressReason, WP_RENDER_HEADER } from './src/lib/wp-routing.js';
import { proxyToWordPress } from './server/wp-proxy.js';

export const config = {
  // Build assets never need WordPress.
  matcher: ['/((?!assets/).*)'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const reason = wordPressReason({
    method: request.method,
    url,
    cookie: request.headers.get('cookie'),
    renderHeader: request.headers.get(WP_RENDER_HEADER),
  });
  if (!reason) return undefined; // continue to the static site
  const response = await proxyToWordPress(request, process.env);
  // WordPress unreachable: fall through to the static copy (e.g. the sitemaps
  // generated at build time) or the static 404 page.
  return response || undefined;
}
