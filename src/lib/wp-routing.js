/**
 * Which requests must be answered by WordPress (the CMS/backend) instead of the
 * prerendered front end. Shared by the Vercel middleware (middleware.js), the
 * local dev/preview proxy (server/vite-wp-proxy.js) and the in-page link
 * handler (MainLayout), so every environment routes identically.
 *
 * WordPress keeps everything that is dynamic on the live site: accounts and
 * login, LearnPress profile/enrolment/checkout/lessons for logged-in users,
 * comments, Contact Form 7, search, feeds and the REST API.
 *
 * Not WordPress any more: the XML sitemaps (generated at build time by
 * scripts/sitemap.mjs, so they list exactly the pages of this site) and old URLs
 * (answered by src/lib/legacy-urls.js before these rules are consulted).
 */
import { LOCAL_COURSE_PATHS } from '../data/local-course-paths.js';

/** Paths that only WordPress can serve. */
const WP_PATHS = [
  /^\/wp-login\.php$/,
  /^\/wp-signup\.php$/,
  /^\/wp-activate\.php$/,
  /^\/wp-trackback\.php$/,
  /^\/wp-comments-post\.php$/,
  /^\/wp-cron\.php$/,
  /^\/xmlrpc\.php$/,
  /^\/wp-admin(\/|$)/,
  /^\/wp-json(\/|$)/,
  /^\/wp-includes\//,
  /^\/wp-content\/(plugins|themes)\//,
  /^\/lp-ajax-handle\/?$/,
  /^\/lp-checkout(\/|$)/,
  // LearnPress profile pages of a user (/lp-profile/<user>/...); /lp-profile/ itself is prerendered
  /^\/lp-profile\/[^/]+/,
  // RSS/Atom feeds (site, comments, per-term and per-post feeds)
  /(^|\/)feed(\/|$)/,
];

/** WordPress query variables that change what WordPress renders for a URL. */
const WP_QUERY_KEYS = [
  's',
  'p',
  'page_id',
  'attachment_id',
  'preview',
  'preview_id',
  'preview_nonce',
  'unapproved',
  'moderation-hash',
  'replytocom',
  'cat',
  'tag',
  'author',
  'feed',
  'post_type',
  'name',
  'pagename',
  'm',
  'year',
  'monthnum',
  'day',
  'w',
  'rest_route',
  'lp-ajax',
];

/** Cookies that mean WordPress must render the page for this visitor. */
const WP_COOKIE = /(?:^|;\s*)(?:wordpress_logged_in_[^=]*|wp-postpass_[^=]*|comment_author_[^=]*)=/;

/** Header the front end sends when it needs WordPress' rendering of a page (e.g. published comments). */
export const WP_RENDER_HEADER = 'x-asts-render';

const LOCAL_ONLY = new Set(LOCAL_COURSE_PATHS);

/** True for pages that exist only on this site (never on WordPress). */
export function isLocalOnlyPath(pathname) {
  return LOCAL_ONLY.has(pathname.endsWith('/') ? pathname : pathname + '/');
}

export function isWordPressPath(pathname) {
  return WP_PATHS.some((re) => re.test(pathname));
}

// `paged`, `c_search` and `order_by` are deliberately absent: the prerendered
// course archives handle them (the live archive loads them via AJAX as well).
export function hasWordPressQuery(searchParams) {
  return WP_QUERY_KEYS.some((k) => searchParams.has(k));
}

/**
 * Returns the reason WordPress must answer this request, or null when the
 * prerendered front end serves it.
 * @param {{ method: string, url: URL, cookie?: string|null, renderHeader?: string|null }} req
 */
export function wordPressReason({ method, url, cookie, renderHeader }) {
  if (method !== 'GET' && method !== 'HEAD') return 'method';
  // Pages of courses that exist only on this site: WordPress has no such page, even for logged-in visitors.
  if (isLocalOnlyPath(url.pathname) && !hasWordPressQuery(url.searchParams)) return null;
  if (cookie && WP_COOKIE.test(cookie)) return 'session';
  if (renderHeader === 'wordpress') return 'render-header';
  if (isWordPressPath(url.pathname)) return 'path';
  if (hasWordPressQuery(url.searchParams)) return 'query';
  return null;
}

/** Link handling in the browser: true when a same-site URL must be loaded from the server (not routed client-side). */
export function needsServerNavigation(url) {
  return isWordPressPath(url.pathname) || hasWordPressQuery(url.searchParams);
}
