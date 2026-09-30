// Enumerates every URL of the site (used by prerender and sitemap generation).
import fs from 'fs';
import path from 'path';

const j = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

export function listRoutes() {
  const pagesSeo = j('src/data/pages-seo.json');
  const coursesIndex = j('src/data/courses-index.json');
  const categories = j('src/data/categories.json');
  const testimonials = j('src/data/testimonials.json');

  const staticPages = Object.keys(pagesSeo)
    .filter((k) => k !== '/?s=' && k !== '/404')
    .map((k) => (k === '/courses__trashed/hadoop/' ? '/hadoop/' : k));

  const courseUrls = coursesIndex.map((c) => c.url);
  const itemUrls = [];
  for (const c of coursesIndex) {
    const full = j(path.join('src/data/courses', c.slug + '.json'));
    for (const s of full.sections) for (const it of s.items) itemUrls.push(it.url);
  }
  const categoryUrls = categories.map((c) => c.url);
  const testimonialUrls = testimonials.map((t) => '/testimonials/' + t.slug + '/');

  const all = [...new Set([...staticPages, ...courseUrls, ...categoryUrls, ...testimonialUrls, ...itemUrls, '/404'])];
  return all;
}

export function sitemapGroups() {
  const pagesSeo = j('src/data/pages-seo.json');
  const coursesIndex = j('src/data/courses-index.json');
  const categories = j('src/data/categories.json');
  const testimonials = j('src/data/testimonials.json');
  return {
    page: Object.keys(pagesSeo)
      .filter((k) => !['/?s=', '/404', '/rselements_pro/courses-categories/', '/testimonial-category/student-reviews/'].includes(k))
      .map((k) => (k === '/courses__trashed/hadoop/' ? '/hadoop/' : k)),
    lp_course: ['/courses/', ...coursesIndex.map((c) => c.url)],
    course_category: categories.map((c) => c.url),
    testimonials: testimonials.map((t) => '/testimonials/' + t.slug + '/'),
    rselements_pro: ['/rselements_pro/courses-categories/'],
    'testimonial-category': ['/testimonial-category/student-reviews/'],
  };
}
