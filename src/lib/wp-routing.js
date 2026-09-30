/**
 * Which requests must be answered by WordPress (the CMS/backend) instead of the
 * prerendered front end. Shared by the Vercel middleware (middleware.js), the
 * local dev/preview proxy (server/vite-wp-proxy.js) and the in-page link
 * handler (MainLayout), so every environment routes identically.
 *
 * WordPress keeps everything that is dynamic on the live site: accounts and
 * login, LearnPress profile/enrolment/checkout/lessons for logged-in users,
 * comments, Contact Form 7, search, feeds, Yoast sitemaps, the REST API and
 * any URL the front end does not prerender (attachment pages, legacy URLs, 404s).
 */

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
  // RSS/Atom feeds (site, comments, per-term and per-post feeds)
  /(^|\/)feed(\/|$)/,
  // Yoast SEO sitemaps and their stylesheet
  /^\/sitemap_index\.xml$/,
  /^\/sitemap\.xml$/,
  /^\/[a-z0-9_-]+-sitemap[0-9]*\.xml$/i,
  /^\/main-sitemap\.xsl$/,
  /^\/wp-sitemap/,
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
