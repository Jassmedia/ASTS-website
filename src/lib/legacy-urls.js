/**
 * Where an old URL of the WordPress site goes on the new site.
 *
 * Shared by the Vercel middleware (middleware.js), the local dev/preview server
 * (server/vite-wp-proxy.js), scripts/build-data.mjs (links inside captured content) and
 * scripts/check-links.mjs, so every environment answers old URLs identically.
 *
 *   resolveLegacyUrl('/python-online-training')  -> { redirect: '/courses/python-online-training/' }
 *   resolveLegacyUrl('/tag/fdqm/')               -> { redirect: '/courses/fdmee-online-training/' }
 *   resolveLegacyUrl('/slider-33/')              -> { gone: true }
 *   resolveLegacyUrl('/contact/')                -> null (a page of the new site)
 *
 * Exact rules come from src/data/redirects.js (scripts/gen-redirects.mjs); the patterns below
 * cover the URL shapes WordPress redirected by itself. Targets are always pages of the new site
 * that resolve to null here, so a redirect can never loop or chain.
 */
import { REDIRECTS, GONE, COURSE_SLUGS, COURSE_ALIASES, INSTRUCTORS, RESERVED } from '../data/redirects.js';

const GONE_SET = new Set(GONE);
const COURSES = new Set(COURSE_SLUGS);
const RESERVED_SET = new Set(RESERVED);
const course = (slug) => `/courses/${slug}/`;

/** Lower-case path ending in one slash: old links exist with and without it. */
function normalize(pathname) {
  let p = pathname;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    /* keep the raw path */
  }
  p = p.toLowerCase().replace(/\/{2,}/g, '/');
  if (!p.startsWith('/')) p = '/' + p;
  return p.endsWith('/') ? p : p + '/';
}

/**
 * The course a root-level name stands for: its slug, a short name the old site used, the slug
 * without "-online-training" or a numbered copy of it, or the unambiguous start of a slug
 * (WordPress guessed these the same way).
 */
function courseFor(name) {
  if (COURSES.has(name)) return name;
  if (COURSE_ALIASES[name]) return COURSE_ALIASES[name];
  if (COURSES.has(name + '-online-training')) return name + '-online-training';
  const stripped = name.replace(/-copy$/, '').replace(/-?\d+$/, '');
  if (stripped && stripped !== name) return courseFor(stripped);
  if (name.length >= 4) {
    const hits = COURSE_SLUGS.filter((s) => s.startsWith(name + '-'));
    if (hits.length === 1) return hits[0];
  }
  return null;
}

/**
 * @param {string} pathname  URL path as requested (any case, with or without the trailing slash)
 * @returns {{ redirect: string } | { gone: true } | null}
 */
export function resolveLegacyUrl(pathname) {
  // /index.php and /index.php/<path>
  if (/^\/index\.php(\/|$)/i.test(pathname)) {
    const rest = normalize(pathname.replace(/^\/index\.php/i, '') || '/');
    return resolveLegacyUrl(rest) || { redirect: rest };
  }
  // Files (images, XML, PHP scripts) are never legacy pages.
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return null;

  const p = normalize(pathname);
  if (REDIRECTS[p]) return { redirect: REDIRECTS[p] };
  if (GONE_SET.has(p)) return { gone: true };

  const seg = p.split('/').filter(Boolean);
  if (!seg.length) return null;

  // Old archive pagination: every course is now listed on /courses/, and the blog has no posts.
  const paged = /^\/(courses|blog)\/page\/\d+\/$/.exec(p);
  if (paged) return { redirect: `/${paged[1]}/` };

  // WordPress oEmbed views of the homepage and of a course.
  if (seg[seg.length - 1] === 'embed') {
    if (seg.length === 1) return { redirect: '/' };
    if (seg.length === 3 && seg[0] === 'courses' && COURSES.has(seg[1])) return { redirect: course(seg[1]) };
  }

  // /course/<slug>/ (singular) and /instructor/<name>/
  if (seg[0] === 'course' && seg[1]) {
    const c = courseFor(seg[1]);
    return c ? { redirect: course(c) } : null;
  }
  if (seg[0] === 'instructor' && seg[1]) {
    const c = INSTRUCTORS[seg[1]] || courseFor(seg[1]);
    return c ? { redirect: course(c) } : null;
  }

  // Root-level course names, with anything after them: /python-online-training/,
  // /python-online-training/python/ (instructor link), /arcs/ ...
  if (RESERVED_SET.has(seg[0])) return null;
  const c = courseFor(seg[0]);
  return c ? { redirect: course(c) } : null;
}

/** HTML body of the "410 Gone" answer for old URLs that have no equivalent. */
export const GONE_HTML =
  '<!doctype html><html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<meta name="robots" content="noindex"><title>Page removed - ASTSTraining</title>' +
  '<style>body{margin:0;font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1b2940;background:#f5f8fc;display:grid;place-items:center;min-height:100vh}' +
  'main{max-width:520px;padding:32px;text-align:center}h1{font-size:28px;margin:0 0 12px;color:#0b1f3a}a{color:#1789ad;font-weight:600}</style></head>' +
  '<body><main><h1>This page has been removed</h1><p>The page you are looking for is no longer part of ASTS Training.</p>' +
  '<p><a href="/courses/">Browse all courses</a> or go to the <a href="/">homepage</a>.</p></main></body></html>';
