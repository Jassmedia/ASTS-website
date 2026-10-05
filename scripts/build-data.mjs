// Generates the app's data modules from the audited raw data (src/data/raw).
// Run: node scripts/build-data.mjs
import fs from 'fs';
import path from 'path';
import { LOCAL_COURSES, PUBLISHED } from '../src/data/local-courses.mjs';
import { NOINDEX_PAGES, PAGE_REDIRECTS } from '../src/data/retired-pages.mjs';
import { resolveLegacyUrl } from '../src/lib/legacy-urls.js';

const RAW = 'src/data/raw';
const raw = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));
const write = (f, data) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(data, null, 0));
};
const ORIGIN = 'https://aststraining.com';
const rel = (u) => (u || '').replace(ORIGIN, '');
// The snapshot keeps &gt; &lt; &nbsp; encoded in text values; React escapes attribute values
// itself, so they are decoded here (otherwise "Co&gt;Operating" is served as "Co&amp;gt;Operating").
const plain = (s) => (typeof s === 'string' ? s.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&nbsp;/g, ' ') : s);

// Links inside captured content: same-site links become relative, links to an old address go
// straight to the page that now answers it (src/lib/legacy-urls.js), and page links end in "/".
const SAME_SITE = /^https?:\/\/(www\.)?aststraining\.com(?=\/|$)/i;
const fixLinks = (html) =>
  (html || '').replace(/(<a\b[^>]*?\bhref=")([^"]*)(")/gi, (m, pre, href, post) => {
    let target = href.trim();
    if (SAME_SITE.test(target)) target = target.replace(SAME_SITE, '') || '/';
    else if (!target.startsWith('/') || target.startsWith('//')) return m; // external, anchor, mailto, tel
    const cut = target.search(/[?#]/);
    const pathname = cut < 0 ? target : target.slice(0, cut);
    const tail = cut < 0 ? '' : target.slice(cut);
    const legacy = resolveLegacyUrl(pathname);
    if (legacy && legacy.redirect) return pre + legacy.redirect + tail + post;
    const isPage = !/\.[a-z0-9]{2,5}$/i.test(pathname) && !/^\/wp-/.test(pathname);
    return pre + (isPage && !pathname.endsWith('/') ? pathname + '/' : pathname) + tail + post;
  });

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
    title: plain(e.title),
    description: plain(e.description) || undefined,
    canonical: e.canonical || undefined,
    // Leftover pages kept online but out of the index (src/data/retired-pages.mjs).
    robots: NOINDEX_PAGES.includes(key) ? 'noindex, follow' : e.robots,
    ogType: e.ogType || undefined,
    ogTitle: plain(e.ogTitle) || undefined,
    ogDescription: plain(e.ogDescription) || undefined,
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

fs.rmSync('src/data/courses', { recursive: true, force: true });
for (const c of courses) {
  const key = rel(c.url);
  write('src/data/courses/' + c.slug + '.json', {
    slug: c.slug,
    id: c.id,
    title: c.title,
    description: fixLinks(c.description),
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

// --- courses that exist only on this site (src/data/local-courses.mjs) ---
// Same shapes as the WordPress courses above; `local: true` tells the course page to skip the
// LearnPress parts WordPress would have to answer (enrolment, reviews, comments).
const LOCAL_TERMS = [
  'We will Provide Supporting to resolve Student practical Issues.',
  'We will provide server Access and 100% Lab Facility.',
  'Resume Preparation.',
  'Interview Questions &amp; Answers.',
  'We will conduct mock interviews. Student also gets 100% supporting before and after getting job.',
];
const LOCAL_AVATAR = 'https://secure.gravatar.com/avatar/?s=200&d=mm&r=g';
const LOCAL_BODY = 'wp-singular lp_course-template-default single single-lp_course wp-custom-logo wp-theme-Aststraining Aststraining learnpress learnpress-page elementor-default elementor-kit-1820';
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const stripTags = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// "About X ..." cut at a word boundary, like the LearnPress archive excerpts.
const excerpt = (text, max = 150) => (text.length <= max ? text : text.slice(0, text.lastIndexOf(' ', max)) + '...');

const localIndex = LOCAL_COURSES.map((lc) => {
  const cat = cats.find((c) => c.slug === lc.category);
  if (!cat) throw new Error(`local course ${lc.slug}: unknown category "${lc.category}"`);
  const url = `/courses/${lc.slug}/`;
  const canonical = ORIGIN + url;
  const image = `/images/courses/${lc.slug}.webp`;
  const category = { slug: cat.slug, name: cat.name, url: rel(cat.url) };
  const lessons = lc.sections.reduce((n, s) => n + s.items.length, 0);
  const list = (items) => '<ul>\n' + items.map((i) => `<li>${escHtml(i)}</li>`).join('\n') + '\n</ul>';
  const description = [
    `<h3>About ${escHtml(lc.title)}</h3>`,
    ...lc.about.map((p) => `<p style="text-align: justify;">${escHtml(p)}</p>`),
    '<h3>What You Will Learn</h3>',
    list(lc.learn),
    `<h3>Prerequisites For Learning ${escHtml(lc.title)}</h3>`,
    list(lc.prerequisites),
    '<h3>Terms And Conditions</h3>',
    '<ul>\n' + LOCAL_TERMS.map((t) => `<li>${t}</li>`).join('\n') + '\n</ul>',
  ].join('\n');
  const text = stripTags(description);
  const short = excerpt(text);
  // Search-result snippet: the course summary itself, without the repeated heading.
  const metaDesc = excerpt(lc.about[0], 155);
  const minutes = Math.max(1, Math.round(text.split(' ').length / 200));
  const seoTitle = `${lc.title} - ASTSTraining`;
  const name = lc.title.replace(/ Online Training$/, '');

  write('src/data/courses/' + lc.slug + '.json', {
    slug: lc.slug,
    id: lc.slug,
    local: true,
    title: lc.title,
    description,
    curriculumInfo: plural(lc.sections.length, 'Section') + plural(lessons, 'Lesson') + lc.duration,
    sections: lc.sections.map((s, si) => ({
      id: `${lc.slug}-${si + 1}`,
      title: s.title,
      count: String(s.items.length),
      collapsed: true,
      items: s.items.map((title, ii) => ({ id: `${lc.slug}-${si + 1}-${ii + 1}`, order: ii + 1, type: 'lp_lesson', number: `${si + 1}.${ii + 1}`, title, status: 'locked' })),
    })),
    author: {
      title: 'ASTS Training',
      link: '',
      desc: `${lc.title} is provided by a real time consultant. The experience acquired by our trainer on ${name}, is promisingly helpful to the corporate trainee’s. Our instructors are experts in the implementation and support projects. ASTS always works on real time scenarios. It is extremely useful for the professionals to handle the projects easily in the IT industry.`,
      avatar: LOCAL_AVATAR,
    },
    instructorAvatar: LOCAL_AVATAR,
    lpBreadcrumb: [{ url: '/', name: 'Home' }, { url: '/courses/', name: 'Courses' }, { url: category.url, name: category.name }],
    enrollBtn: 'Register Now',
    seo: {
      title: seoTitle,
      description: metaDesc,
      canonical,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      ogType: 'article',
      ogTitle: seoTitle,
      ogDescription: metaDesc,
      ogImage: ORIGIN + image,
      ogImageWidth: '1000',
      ogImageHeight: '600',
      ogImageType: 'image/webp',
      articlePublisher: 'https://www.facebook.com/aststrainingonline/',
      articleModified: PUBLISHED,
      twitterCard: 'summary_large_image',
      twitterSite: '@AstsTraining',
      twitterLabel1: 'Est. reading time',
      twitterData1: plural(minutes, 'minute'),
      schema: {
        type: 'WebPage',
        url: canonical,
        name: seoTitle,
        description: metaDesc,
        datePublished: PUBLISHED,
        dateModified: PUBLISHED,
        about: false,
        image: { url: ORIGIN + image, width: 1000, height: 600 },
        breadcrumb: [{ name: 'Courses', item: ORIGIN + '/courses/' }, { name: lc.title }],
      },
      bodyClass: LOCAL_BODY,
      pageTitle: lc.title,
      bcBg: '/wp-content/uploads/2020/12/Home-dot-bg.jpg',
      bcTitle: ['ASTSTraining', 'Courses', category.name, lc.title],
      bcLinks: [
        { url: '/', name: 'ASTSTraining' },
        { url: '/courses/', name: 'Courses' },
        { url: category.url, name: category.name },
      ],
      bcWrapperClass: 'porfolio-details',
      hasBreadcrumbs: true,
    },
  });

  return {
    slug: lc.slug,
    id: lc.slug,
    local: true,
    title: lc.title,
    url,
    categories: [category],
    instructor: 'ASTS Training',
    instructorUrl: '',
    duration: lc.duration,
    level: lc.level,
    lessons: plural(lessons, 'lesson'),
    quizzes: '0 quizzes',
    students: '0 students',
    lessonsLabel: cap(plural(lessons, 'Lesson')),
    quizzesLabel: '0 Quizzes',
    studentsLabel: '0 Students',
    thumb: image,
    thumbAlt: 'course thumbnail',
    preview: image,
    previewAlt: lc.title,
    short,
    readmore: 'Enroll Now',
    published: PUBLISHED,
    modified: PUBLISHED,
    seoTitle,
  };
});
for (const c of localIndex) {
  if (index.some((x) => x.slug === c.slug)) throw new Error(`local course ${c.slug} is also a WordPress course`);
}
// The newest courses lead the archive, as LearnPress orders it.
const fullIndex = [...localIndex, ...index].map((c, i) => ({ ...c, archiveIndex: i }));
write('src/data/courses-index.json', fullIndex);
// Paths the proxy must never hand to WordPress (it has no such page, not even for logged-in visitors).
fs.writeFileSync(
  'src/data/local-course-paths.js',
  '// Generated by scripts/build-data.mjs from src/data/local-courses.mjs: do not edit.\n' +
    `export const LOCAL_COURSE_PATHS = ${JSON.stringify(localIndex.map((c) => c.url), null, 2)};\n`,
);

// --- categories ---
const catData = cats.map((c) => ({
  slug: c.slug,
  name: c.name,
  url: rel(c.url),
  termId: c.termId,
  courses: [...localIndex.filter((l) => l.categories[0].slug === c.slug).map((l) => l.slug), ...c.items.map((i) => index.find((x) => x.url === rel(i.url)).slug)],
  seo: seoOf(rel(c.url)),
}));
write('src/data/categories.json', catData);

// --- static pages seo (everything that is not a course/category/testimonial) ---
const pagesSeo = {};
for (const key of Object.keys(seo)) {
  if (key in PAGE_REDIRECTS) continue; // redirected to its equivalent page, not built
  if (/^\/courses\/.+|^\/courses-category\/|^\/testimonials\//.test(key)) continue;
  pagesSeo[key] = seoOf(key);
}
write('src/data/pages-seo.json', pagesSeo);

// --- static page content (CMS HTML captured from the live site) ---
const content = {};
const STATIC_PAGES = ['about-asts-training', 'about-asts-training__testimonials', 'a-homepage-section', 'become-a-teacher', 'blog', 'blog-old', 'hadoop', 'home', 'instructor', 'instructors', 'lp-checkout', 'lp-profile', 'privacy-policy', 'privacy-policy-2', 'sample-page', 'terms-conditions', 'term_conditions', 'thanks', 'training-programs'];
for (const f of fs.readdirSync(path.join(RAW, 'content'))) {
  if (!STATIC_PAGES.includes(f.replace('.html', ''))) continue;
  if (('/' + f.replace('.html', '').replace(/__/g, '/') + '/') in PAGE_REDIRECTS) continue;
  content[f.replace('.html', '')] = fixLinks(
    fs
      .readFileSync(path.join(RAW, 'content', f), 'utf8')
      .replace(/https:\/\/aststraining\.com\//g, '/')
      .replace(/ srcset="[^"]*"/g, '')
      .replace(/ sizes="[^"]*"/g, ''),
  );
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

console.log('courses', fullIndex.length, `(${localIndex.length} local)`, '| categories', catData.length, '| page seo', Object.keys(pagesSeo).length, '| content', Object.keys(content).length, '| testimonials', tst.length);
console.log('index.json bytes', fs.statSync('src/data/courses-index.json').size, '| page-content bytes', fs.statSync('src/data/page-content.json').size, '| pages-seo bytes', fs.statSync('src/data/pages-seo.json').size);
const sizes = fs.readdirSync('src/data/courses').map((f) => fs.statSync(path.join('src/data/courses', f)).size);
console.log('course chunk bytes min/max/avg', Math.min(...sizes), Math.max(...sizes), Math.round(sizes.reduce((a, b) => a + b) / sizes.length));
