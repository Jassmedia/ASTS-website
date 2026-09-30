// Generates the app's data modules from the audited raw data (src/data/raw).
// Run: node scripts/build-data.mjs
import fs from 'fs';
import path from 'path';

const RAW = 'src/data/raw';
const raw = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));
const write = (f, data) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(data, null, 0));
};
const ORIGIN = 'https://aststraining.com';
const rel = (u) => (u || '').replace(ORIGIN, '');

const courses = raw('courses.json');
const cards = raw('courses-cards.json');
const cats = raw('categories.json');
const order = raw('courses-archive-order.json');
const seo = raw('seo.json');
const attachments = raw('attachments.json');

// Compact schema descriptor derived from the live Yoast JSON-LD graph.
function schemaInfo(entry) {
  if (!entry || !entry.schema) return null;
  let g;
  try {
    g = JSON.parse(entry.schema)['@graph'];
  } catch {
    return null;
  }
  const page = g.find((n) => n['@type'] === 'WebPage' || n['@type'] === 'CollectionPage');
  const img = g.find((n) => n['@type'] === 'ImageObject' && /#primaryimage$/.test(n['@id']));
  const bc = g.find((n) => n['@type'] === 'BreadcrumbList');
  if (!page) return null;
  return {
    type: page['@type'],
    url: page.url,
    name: page.name,
    description: page.description || undefined,
    datePublished: page.datePublished || undefined,
    dateModified: page.dateModified || undefined,
    about: !!page.about,
    image: img ? { url: img.url, width: img.width, height: img.height } : undefined,
    breadcrumb: bc ? bc.itemListElement.map((i) => ({ name: i.name, item: i.item })) : undefined,
  };
}

function seoOf(key) {
  const e = seo[key];
  if (!e) return null;
  const o = {
    title: e.title,
    description: e.description || undefined,
    canonical: e.canonical || undefined,
    robots: e.robots,
    ogType: e.ogType || undefined,
    ogTitle: e.ogTitle || undefined,
    ogDescription: e.ogDescription || undefined,
    ogImage: e.ogImage || undefined,
    ogImageWidth: e.ogImageWidth || undefined,
    ogImageHeight: e.ogImageHeight || undefined,
    ogImageType: e.ogImageType || undefined,
    articlePublisher: e.articlePublisher || undefined,
    articlePublished: e.articlePublished || undefined,
    articleModified: e.articleModified || undefined,
    twitterCard: e.twitterCard || undefined,
    twitterSite: e.twitterSite || undefined,
    twitterLabel1: e.twitterLabel1 || undefined,
    twitterData1: e.twitterData1 || undefined,
    schema: schemaInfo(e) || undefined,
    bodyClass: e.bodyClass,
    pageTitle: e.pageTitle || undefined,
    bcBg: rel(e.bcBg) || undefined,
    bcTitle: e.bcTitle && e.bcTitle.length ? e.bcTitle : undefined,
    bcLinks: e.bcLinks && e.bcLinks.length ? e.bcLinks.map((l) => ({ url: rel(l.url) || '/', name: l.name })) : undefined,
    bcInnerClass: e.bcInnerClass || undefined,
    bcWrapperClass: e.bcWrapperClass || undefined,
    hasBreadcrumbs: e.hasBreadcrumbs,
  };
  return JSON.parse(JSON.stringify(o));
}

// --- courses ---
const catSlug = (u) => rel(u).replace('/courses-category/', '').replace(/\/$/, '');
// LearnPress prints "Free" for every course that has no price set, so the scraped label is not a
// pricing status. Keep only a price the course actually defines; no price means no badge.
const coursePrice = (p) => (p && !/^free$/i.test(p.trim()) ? p : undefined);
const index = order.map((o, i) => {
  const c = courses.find((x) => x.url === o.url);
  const card = cards.find((x) => x.url === o.url);
  return {
    slug: c.slug,
    id: c.id,
    title: c.title,
    url: rel(c.url),
    archiveIndex: i,
    categories: c.categories.map((x) => ({ slug: catSlug(x.url), name: x.name, url: rel(x.url) })),
    instructor: c.instructorName,
    instructorUrl: card.instructorUrl,
    duration: c.duration,
    level: c.level,
    lessons: c.lessons,
    quizzes: c.quizzes,
    students: c.students,
    lessonsLabel: card.lessons,
    quizzesLabel: card.quizzes,
    studentsLabel: card.students,
    thumb: rel(card.thumb),
    thumbAlt: card.thumbAlt,
    preview: rel(c.previewImg),
    previewAlt: c.previewAlt,
    short: card.short,
    price: coursePrice(c.price),
    readmore: card.readmore,
    published: c.published,
    modified: c.modified,
    seoTitle: c.seoTitle,
  };
});
write('src/data/courses-index.json', index);

fs.rmSync('src/data/courses', { recursive: true, force: true });
for (const c of courses) {
  const key = rel(c.url);
  write('src/data/courses/' + c.slug + '.json', {
    slug: c.slug,
    id: c.id,
    title: c.title,
    description: c.description,
    curriculumInfo: c.curriculumInfo,
    sections: c.sections.map((s) => ({
      id: s.id,
      title: s.title,
      count: s.count,
      collapsed: s.collapsed,
      items: s.items.map((i) => ({ id: i.id, order: i.order, type: i.type, url: rel(i.url), number: i.number, title: i.title, status: i.status })),
    })),
    author: { title: c.author.title, link: rel(c.author.link), desc: c.author.desc, avatar: c.author.avatar },
    instructorAvatar: c.instructorAvatar,
    lpBreadcrumb: c.lpBreadcrumb.map((b) => ({ url: b.url ? rel(b.url) || '/' : null, name: b.name })),
    enrollBtn: c.enrollBtn,
    seo: seoOf(key),
  });
}

// --- categories ---
const catData = cats.map((c) => ({
  slug: c.slug,
  name: c.name,
  url: rel(c.url),
  termId: c.termId,
  courses: c.items.map((i) => index.find((x) => x.url === rel(i.url)).slug),
  seo: seoOf(rel(c.url)),
}));
write('src/data/categories.json', catData);

// --- static pages seo (everything that is not a course/category/testimonial) ---
const pagesSeo = {};
for (const key of Object.keys(seo)) {
  if (/^\/courses\/.+|^\/courses-category\/|^\/testimonials\//.test(key)) continue;
  pagesSeo[key] = seoOf(key);
}
write('src/data/pages-seo.json', pagesSeo);

// --- static page content (CMS HTML captured from the live site) ---
const content = {};
const STATIC_PAGES = ['about-asts-training', 'about-asts-training__testimonials', 'a-homepage-section', 'become-a-teacher', 'blog', 'blog-old', 'hadoop', 'home', 'instructor', 'instructors', 'lp-checkout', 'lp-profile', 'privacy-policy', 'privacy-policy-2', 'sample-page', 'terms-conditions', 'term_conditions', 'thanks', 'training-programs'];
for (const f of fs.readdirSync(path.join(RAW, 'content'))) {
  if (!STATIC_PAGES.includes(f.replace('.html', ''))) continue;
  content[f.replace('.html', '')] = fs
    .readFileSync(path.join(RAW, 'content', f), 'utf8')
    .replace(/https:\/\/aststraining\.com\//g, '/')
    .replace(/ srcset="[^"]*"/g, '')
    .replace(/ sizes="[^"]*"/g, '');
}
write('src/data/page-content.json', content);

// --- testimonials ---
const T1 =
  'The training on the ASTS platform is pretty much effective. I learned Hyperion there and now working in a decent company. All ASTS Trainers are well-experienced and very encouraging in nature';
const E1 = 'The training on the ASTS platform is pretty much effective. I learned Hyperion there and now working in a decent...';
const base = { designation: 'Student', date: 'December 1, 2020', author: 'srinivas', image: '/wp-content/uploads/2020/12/man.png', thumb: '/wp-content/uploads/2020/12/man-120x120.png' };
const tst = [
  { slug: 'james', name: 'James', text: T1, excerpt: E1, ...base },
  {
    slug: 'john',
    name: 'John',
    text: 'ASTS helped me get the right opportunities to learn and project myself properly in the professional world. Thank you really for that',
    excerpt: 'ASTS helped me get the right opportunities to learn and project myself properly in the professional world. Thank you really...',
    ...base,
  },
  { slug: 'saiko-najran', name: 'Saiko Najran', text: T1, excerpt: E1, ...base },
].map((t) => ({ ...t, seo: seoOf('/testimonials/' + t.slug + '/') }));
write('src/data/testimonials.json', tst);

// --- attachment pages (WordPress media pages) for redirect generation ---
write('src/data/attachments.json', attachments.map((a) => rel(a.loc)));

console.log('courses', index.length, '| categories', catData.length, '| page seo', Object.keys(pagesSeo).length, '| content', Object.keys(content).length, '| testimonials', tst.length);
console.log('index.json bytes', fs.statSync('src/data/courses-index.json').size, '| page-content bytes', fs.statSync('src/data/page-content.json').size, '| pages-seo bytes', fs.statSync('src/data/pages-seo.json').size);
const sizes = fs.readdirSync('src/data/courses').map((f) => fs.statSync(path.join('src/data/courses', f)).size);
console.log('course chunk bytes min/max/avg', Math.min(...sizes), Math.max(...sizes), Math.round(sizes.reduce((a, b) => a + b) / sizes.length));
