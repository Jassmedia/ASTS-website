// Generates the XML sitemaps into dist/ using the same file names as the
// current Yoast SEO sitemaps (sitemap_index.xml, page-sitemap.xml, ...),
// so the sitemap already submitted in Google Search Console keeps working.
import fs from 'fs';
import path from 'path';
import { sitemapGroups } from './routes-list.mjs';

const ORIGIN = 'https://aststraining.com';
const j = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const pagesSeo = j('src/data/pages-seo.json');
const coursesIndex = j('src/data/courses-index.json');
const categories = j('src/data/categories.json');
const testimonials = j('src/data/testimonials.json');

const lastmodOf = (url) => {
  const key = url === '/hadoop/' ? '/courses__trashed/hadoop/' : url;
  if (pagesSeo[key] && pagesSeo[key].articleModified) return pagesSeo[key].articleModified;
  const c = coursesIndex.find((x) => x.url === url);
  if (c && c.modified) return c.modified;
  const cat = categories.find((x) => x.url === url);
  if (cat && cat.seo && cat.seo.articleModified) return cat.seo.articleModified;
  const t = testimonials.find((x) => '/testimonials/' + x.slug + '/' === url);
  if (t && t.seo && t.seo.articleModified) return t.seo.articleModified;
  return null;
};

const esc = (s) => s.replace(/&/g, '&amp;');
const urlset = (urls) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `\t<url>\n\t\t<loc>${esc(ORIGIN + u)}</loc>\n${lastmodOf(u) ? `\t\t<lastmod>${lastmodOf(u)}</lastmod>\n` : ''}\t</url>`).join('\n') +
  `\n</urlset>\n`;

const dist = process.argv[2] || 'dist';
const groups = sitemapGroups();
const now = new Date().toISOString();
const index = [];
for (const [name, urls] of Object.entries(groups)) {
  const file = `${name}-sitemap.xml`;
  fs.writeFileSync(path.join(dist, file), urlset(urls));
  index.push({ loc: `${ORIGIN}/${file}`, lastmod: now });
}
const indexXml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  index.map((s) => `\t<sitemap>\n\t\t<loc>${s.loc}</loc>\n\t\t<lastmod>${s.lastmod}</lastmod>\n\t</sitemap>`).join('\n') +
  `\n</sitemapindex>\n`;
fs.writeFileSync(path.join(dist, 'sitemap_index.xml'), indexXml);
fs.writeFileSync(path.join(dist, 'sitemap.xml'), indexXml);
console.log('sitemaps written:', Object.entries(groups).map(([k, v]) => `${k}(${v.length})`).join(', '));
