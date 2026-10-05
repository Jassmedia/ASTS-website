// Enumerates every URL of the site (used by prerender and sitemap generation).
import fs from 'fs';
import path from 'path';
import { NOINDEX_PAGES } from '../src/data/retired-pages.mjs';

const j = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

export function listRoutes() {
  const pagesSeo = j('src/data/pages-seo.json');
  const coursesIndex = j('src/data/courses-index.json');
  const categories = j('src/data/categories.json');
  const testimonials = j('src/data/testimonials.json');

  // pages-seo.json no longer holds the leftover pages that redirect (data/retired-pages.mjs).
  const staticPages = Object.keys(pagesSeo).filter((k) => k !== '/?s=' && k !== '/404');

  const courseUrls = coursesIndex.map((c) => c.url);
  const itemUrls = [];
  for (const c of coursesIndex) {
    const full = j(path.join('src/data/courses', c.slug + '.json'));
    // Lessons of local courses (data/local-courses.mjs) have no page.
    for (const s of full.sections) for (const it of s.items) if (it.url) itemUrls.push(it.url);
  }
  const categoryUrls = categories.map((c) => c.url);
  const testimonialUrls = testimonials.map((t) => '/testimonials/' + t.slug + '/');

  const all = [...new Set([...staticPages, ...courseUrls, ...categoryUrls, ...testimonialUrls, ...itemUrls, '/404'])];
  return all;
}

/**
 * The URLs of the XML sitemaps, grouped under the file names Yoast used (page-sitemap.xml, ...).
 * Only pages that are indexable and canonical for themselves: no noindex pages, no lessons or
 * quizzes (their canonical is the course), no attachment pages, nothing that redirects.
 */
export function sitemapGroups() {
  const pagesSeo = j('src/data/pages-seo.json');
  const coursesIndex = j('src/data/courses-index.json');
  const categories = j('src/data/categories.json');
  const testimonials = j('src/data/testimonials.json');
  return {
    page: Object.keys(pagesSeo).filter((k) => !['/?s=', '/404', '/courses/'].includes(k) && !NOINDEX_PAGES.includes(k)),
    lp_course: ['/courses/', ...coursesIndex.map((c) => c.url)],
    course_category: categories.map((c) => c.url),
    testimonials: testimonials.map((t) => '/testimonials/' + t.slug + '/'),
  };
}
