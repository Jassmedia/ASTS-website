#!/usr/bin/env node
// -----------------------------------------------------------------------------
// sync-from-wp.mjs — pull the current CMS content from WordPress into src/data/raw
//
// WHAT IT FETCHES
//   WordPress stays the CMS (headless). This script regenerates every file in
//   src/data/raw/ from the WordPress site's *rendered* HTML, exactly in the
//   format scripts/build-data.mjs consumes:
//     - Yoast sitemaps (sitemap_index.xml + page / course_category / lp_course /
//       testimonials / attachment / rselements_pro / testimonial-category
//       sitemaps) to discover every URL
//     - every page, course category, course and testimonial page
//     - the /courses/ archive incl. all ?paged=N pages (card data + ordering)
//     - a few extra templates whose SEO/layout data the app needs
//       (search results, 404, a lesson page, rselements_pro, testimonial-category)
//   and writes:
//     attachments.json, categories.json, courses.json, courses-cards.json,
//     courses-archive-order.json, seo.json, seo-inventory.json, content/*.html,
//     media.json and tags.json (REST API lists of every media item and tag: their
//     attachment/archive URLs are in no sitemap; see scripts/gen-redirects.mjs)
//
// READ-ONLY
//   Only HTTP GET requests are made (max 4 in flight, browser User-Agent,
//   retry with back-off on 429/5xx). It never POSTs, never submits forms and
//   never logs in. Nothing on the WordPress side is changed.
//
// WHEN TO RUN
//   Before the production build:   npm run sync && npm run build
//   (package.json: "sync": "node scripts/sync-from-wp.mjs")
//   and from a Vercel Deploy Hook that WordPress calls on publish/update, so
//   an editor's change in wp-admin triggers sync + rebuild + deploy.
//   The script fails (exit code 1, nothing written) if a page can't be fetched
//   or parsed, so a broken WordPress response never ships an empty site.
//
// USAGE
//   node scripts/sync-from-wp.mjs [--origin https://aststraining.com] [--out src/data/raw]
//   env WP_ORIGIN      host to fetch from           (default https://aststraining.com)
//   env PUBLIC_ORIGIN  origin written into the data (default https://aststraining.com)
//   --cache <dir>      optional: reuse/save raw HTTP responses in <dir> (debugging)
// -----------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';

// ---------- args / config ----------
const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const WP_ORIGIN = arg('--origin', process.env.WP_ORIGIN || 'https://aststraining.com').replace(/\/+$/, '');
const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN || 'https://aststraining.com').replace(/\/+$/, '');
const OUT = path.resolve(arg('--out', 'src/data/raw'));
const CACHE = argv.includes('--cache') ? path.resolve(arg('--cache')) : null;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const CONCURRENCY = 4;
const P = PUBLIC_ORIGIN; // shorthand used when building URLs/keys

// ---------- HTTP (GET only, <=4 concurrent) ----------
let active = 0;
const waiters = [];
const stats = { requests: 0, cacheHits: 0 };
async function slot(fn) {
  if (active >= CONCURRENCY) await new Promise((r) => waiters.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    const next = waiters.shift();
    if (next) next();
  }
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Rewrite the fetch origin to the public origin (plain and JSON-escaped forms).
function toPublic(text) {
  if (WP_ORIGIN === PUBLIC_ORIGIN) return text;
  const host = WP_ORIGIN.replace(/^https?:\/\//, '');
  const pub = PUBLIC_ORIGIN.replace(/^https?:\/\//, '');
  return text
    .replace(new RegExp('https?://' + esc(host), 'g'), PUBLIC_ORIGIN)
    .replace(new RegExp('https?:\\\\/\\\\/' + esc(host), 'g'), PUBLIC_ORIGIN.replace(/\//g, '\\/'))
    .replace(new RegExp('https?%3A%2F%2F' + esc(host), 'gi'), encodeURIComponent(PUBLIC_ORIGIN))
    .replace(new RegExp('//' + esc(host), 'g'), '//' + pub);
}
const fromPublic = (u) => (u.startsWith(PUBLIC_ORIGIN) ? WP_ORIGIN + u.slice(PUBLIC_ORIGIN.length) : u);

/** GET a public URL (fetched from WP_ORIGIN). Returns { status, html }. */
async function get(publicUrl, { allow404 = false } = {}) {
  const url = fromPublic(publicUrl);
  const cacheFile = CACHE && path.join(CACHE, publicUrl.replace(PUBLIC_ORIGIN, '').replace(/[^a-zA-Z0-9._-]+/g, '_') + '.html');
  if (cacheFile && fs.existsSync(cacheFile)) {
    stats.cacheHits++;
    const html = fs.readFileSync(cacheFile, 'utf8');
    return { status: /\/this-page-does-not-exist/.test(publicUrl) ? 404 : 200, html: toPublic(html) };
  }
  return slot(async () => {
    for (let attempt = 1; ; attempt++) {
      stats.requests++;
      let res;
      try {
        res = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        });
      } catch (e) {
        if (attempt < 4) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw new Error(`GET ${url} failed: ${e.message}`);
      }
      const html = await res.text();
      if ((res.status === 429 || res.status >= 500) && attempt < 4) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        continue;
      }
      if (res.status !== 200 && !(allow404 && res.status === 404)) throw new Error(`GET ${url} -> HTTP ${res.status}`);
      if (cacheFile) {
        fs.mkdirSync(CACHE, { recursive: true });
        fs.writeFileSync(cacheFile, html);
      }
      return { status: res.status, html: toPublic(html) };
    }
  });
}

// ---------- tiny HTML helpers (regex based; the markup is theme-generated) ----------
// Entity decoding used for text/meta values. Deliberately partial: numeric
// entities, &amp; &quot; &apos; (&nbsp; &lt; &gt; stay encoded, as in the snapshot).
const dec = (s) =>
  s == null
    ? s
    : s
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
const stripTags = (s) => s.replace(/<[^>]*>/g, '');
const text = (s) => (s == null ? '' : dec(stripTags(s)).replace(/\s+/g, ' ').trim());
const attr = (tag, name) => {
  const m = tag.match(new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i'));
  return m ? (m[1] ?? m[2]) : null;
};
const first = (h, re, g = 1) => {
  const m = h.match(re);
  return m ? m[g] : null;
};
const all = (h, re) => [...h.matchAll(re)];
function meta(h, key, val) {
  for (const m of h.matchAll(/<meta\s[^>]*>/gi)) {
    if (attr(m[0], key) === val) return dec(attr(m[0], 'content') ?? '');
  }
  return '';
}
/** innerHTML of the element whose opening tag starts at `start` (balanced on tagName). */
function inner(h, start, tagName) {
  const open = h.indexOf('>', start) + 1;
  const re = new RegExp('<(/?)' + tagName + '\\b[^>]*>', 'gi');
  re.lastIndex = open;
  let depth = 1;
  let m;
  while ((m = re.exec(h))) {
    if (m[1]) depth--;
    else if (!m[0].endsWith('/>')) depth++;
    if (depth === 0) return h.slice(open, m.index);
  }
  return h.slice(open);
}
/** innerHTML of the first element (tagName) whose opening tag matches `openRe`. */
function el(h, openRe, tagName = 'div') {
  const m = h.match(openRe);
  return m ? inner(h, m.index, tagName) : null;
}
const pathOf = (u) => u.replace(/^https?:\/\/[^/]+/, '') || '/';

// ---------- generic page data (seo.json + seo-inventory.json) ----------
function seoData(h, file) {
  const body = first(h, /<body\b[^>]*>/i, 0);
  const bc = h.indexOf('<div class="rs-breadcrumbs');
  const bcBlock = bc >= 0 ? h.slice(bc, h.indexOf('</header>', bc)) : '';
  const bcTitleEl = el(bcBlock, /<div class="breadcrumbs-title">/);
  const bcSpans = bcTitleEl ? bcTitleEl.split(/<span property="itemListElement"/).slice(1) : [];
  const pageTitle = first(bcBlock, /<h1 class="page-title">([\s\S]*?)<\/h1>/);
  const schema = first(h, /<script type="application\/ld\+json" class="yoast-schema-graph">([\s\S]*?)<\/script>/);
  return {
    file,
    bodyClass: body ? attr(body, 'class') ?? '' : '',
    title: text(first(h, /<title>([\s\S]*?)<\/title>/) ?? ''),
    description: meta(h, 'name', 'description'),
    canonical: attr(first(h, /<link rel="canonical"[^>]*>/, 0) ?? '', 'href') ?? '',
    robots: meta(h, 'name', 'robots'),
    ogLocale: meta(h, 'property', 'og:locale'),
    ogType: meta(h, 'property', 'og:type'),
    ogTitle: meta(h, 'property', 'og:title'),
    ogDescription: meta(h, 'property', 'og:description'),
    ogUrl: meta(h, 'property', 'og:url'),
    ogSiteName: meta(h, 'property', 'og:site_name'),
    ogImage: meta(h, 'property', 'og:image'),
    ogImageWidth: meta(h, 'property', 'og:image:width'),
    ogImageHeight: meta(h, 'property', 'og:image:height'),
    ogImageType: meta(h, 'property', 'og:image:type'),
    articlePublisher: meta(h, 'property', 'article:publisher'),
    articlePublished: meta(h, 'property', 'article:published_time'),
    articleModified: meta(h, 'property', 'article:modified_time'),
    twitterCard: meta(h, 'name', 'twitter:card'),
    twitterSite: meta(h, 'name', 'twitter:site'),
    twitterLabel1: meta(h, 'name', 'twitter:label1'),
    twitterData1: meta(h, 'name', 'twitter:data1'),
    twitterLabel2: meta(h, 'name', 'twitter:label2'),
    twitterData2: meta(h, 'name', 'twitter:data2'),
    schema: schema ?? '',
    pageTitle: pageTitle != null ? text(pageTitle) : '',
    bcBg: first(bcBlock, /class="breadcrumbs-single" style="background-image: url\('([^']*)'\)/) ?? '',
    bcTitle: bcSpans.map((s) => text(first(s, /<span property="name"[^>]*>([\s\S]*?)<\/span>/) ?? '')),
    bcLinks: bcSpans
      .filter((s) => /<a property="item"/.test(s))
      .map((s) => ({ url: attr(first(s, /<a property="item"[^>]*>/, 0), 'href'), name: text(first(s, /<span property="name"[^>]*>([\s\S]*?)<\/span>/)) })),
    bcInnerClass: first(bcBlock, /<div class="breadcrumbs-inner ([^"]*)">/) ?? '',
    hasBreadcrumbs: bc >= 0,
    bcWrapperClass: bc >= 0 ? (attr(first(h, /<div class="rs-breadcrumbs[^"]*"/, 0) + '>', 'class') ?? '').replace('rs-breadcrumbs', '').trim() : '',
    bcHasInnerWrap: /<div class="rs-breadcrumbs-inner">/.test(bcBlock),
    mainWrapper: first(h, /<div class="(col-lg-\d+)\s*">/) ?? '',
  };
}
const SEO_ORDER = ['file', 'bodyClass', 'title', 'description', 'canonical', 'robots', 'ogLocale', 'ogType', 'ogTitle', 'ogDescription', 'ogUrl', 'ogSiteName', 'ogImage', 'ogImageWidth', 'ogImageHeight', 'ogImageType', 'articlePublisher', 'articlePublished', 'articleModified', 'twitterCard', 'twitterSite', 'twitterLabel1', 'twitterData1', 'twitterLabel2', 'twitterData2', 'schema', 'pageTitle', 'bcBg', 'bcTitle', 'bcLinks', 'bcInnerClass', 'hasBreadcrumbs', 'bcWrapperClass', 'bcHasInnerWrap', 'mainWrapper'];
const ordered = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]));
// seo.json values additionally have &nbsp; turned into a plain space and the
// JSON-LD string entity-decoded (seo-inventory.json keeps &nbsp; as-is).
const seoEntry = (s) =>
  ordered(
    { ...s, ...Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, (k === 'schema' ? dec(v) : v).replace(/&nbsp;/g, ' ')])) },
    SEO_ORDER
  );

function inventoryData(h, dir, file, url, s) {
  const bodyClass = s.bodyClass;
  const cf7ids = all(h, /<input type="hidden" name="_wpcf7" value="(\d+)"/g).map((m) => m[1]);
  return {
    dir,
    file,
    url,
    title: s.title,
    desc: s.description,
    ogTitle: s.ogTitle,
    ogDesc: s.ogDescription,
    ogImage: s.ogImage,
    robots: s.robots,
    noindex: /noindex/i.test(s.robots),
    h1s: all(h, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map((m) => text(m[1])),
    template: first(bodyClass, /(?:^|\s)(page-template-[\w-]+)/) ?? '',
    elementor: /data-elementor-type="wp-page"/.test(h),
    cf7: cf7ids.length,
    cf7ids,
    breadcrumbTitle: dec(first(h, /<div class="breadcrumbs-inner">\s*<h1 class="page-title">([\s\S]*?)<\/h1>/) ?? ''),
    size: h.length, // characters of the served HTML (volatile: contains per-request random ids)
  };
}

// ---------- page content fragments ----------
function contentOf(h) {
  const x = h.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const open = '<div class="entry-content">';
  const a = x.indexOf(open);
  if (a >= 0) {
    const e = x.indexOf('<!-- .entry-content -->', a);
    const body = x.slice(a + open.length, e);
    return body.slice(0, body.lastIndexOf('</div>')).trim();
  }
  const s = x.indexOf('<!-- End Header Menu End -->');
  const e = x.indexOf('<!-- .main-container -->');
  if (s >= 0 && e > s) return x.slice(s, e + '<!-- .main-container -->'.length);
  return '';
}

// ---------- LearnPress course cards (archive + category pages) ----------
function cards(h) {
  const list = el(h, /<ul class="learn-press-courses\b[^"]*"[^>]*>/, 'ul') ?? '';
  return list
    .split(/<li class="course">/)
    .slice(1)
    .map((li) => {
      const cat = first(li, /<div class="course-categories">([\s\S]*?)<\/div>/) ?? '';
      const instr = first(li, /<div class="course-instructor">([\s\S]*?)<\/div>/) ?? '';
      const img = first(li, /<div class="course-img"><img[^>]*>/, 0) ?? '';
      return {
        id: first(li, /data-id="(\d+)"/),
        url: attr(first(li, /<a class="course-permalink"[^>]*>/, 0), 'href'),
        thumb: attr(img, 'src'),
        thumbAlt: dec(attr(img, 'alt') ?? ''),
        title: text(first(li, /<span class='course-title'>([\s\S]*?)<\/span>/)),
        instructor: text(first(instr, /<span class="instructor-display-name">([\s\S]*?)<\/span>/) ?? ''),
        instructorUrl: attr(first(instr, /<a[^>]*>/, 0) ?? '', 'href') ?? '',
        category: all(cat, /<a[^>]*>([\s\S]*?)<\/a>/g).map((m) => text(m[1])).join(', '),
        categoryUrl: attr(first(cat, /<a[^>]*>/, 0) ?? '', 'href') ?? '',
        duration: text(first(li, /<span class="course-duration">([\s\S]*?)<\/span>/) ?? ''),
        level: text(first(li, /<span class="course-level">([\s\S]*?)<\/span>/) ?? ''),
        lessons: text(first(li, /<div class="course-count-item lp_lesson">([\s\S]*?)<\/div>/) ?? ''),
        quizzes: text(first(li, /<div class="course-count-item lp_quiz">([\s\S]*?)<\/div>/) ?? ''),
        students: text(first(li, /<div class="course-count-student">([\s\S]*?)<\/div>/) ?? ''),
        short: text(first(li, /<p class="course-short-description">([\s\S]*?)<\/p>/) ?? ''),
        price: text(first(li, /<span class="course-price">([\s\S]*?)<\/span><\/span><\/span>/) ?? ''),
        readmore: text(first(li, /<div class="course-readmore">([\s\S]*?)<\/div>/) ?? ''),
      };
    });
}

// ---------- single course ----------
function courseData(h, url, s) {
  const metaVal = (cls) => text(first(h, new RegExp('<div class="meta-item meta-item-' + cls + '">([\\s\\S]*?)</div>')) ?? '');
  const cats = el(h, /<div class="meta-item meta-item-categories">/) ?? '';
  const instr = el(h, /<div class="meta-item meta-item-instructor">/) ?? '';
  const author = el(h, /<div class="lp-course-author">/) ?? '';
  const preview = first(h, /<div class="media-preview">\s*(<img[^>]*>)/) ?? '';
  const descr = el(h, /<div class="course-description" id="learn-press-course-description">/) ?? '';
  const sectionsHtml = el(h, /<ul class="course-sections">/, 'ul') ?? '';
  const sections = sectionsHtml
    .split(/<li class="course-section\b/)
    .slice(1)
    .map((sec) => {
      const cls = first('<li class="course-section' + sec, /^<li class="([^"]*)"/);
      return {
        id: first(sec, /data-section-id="(\d+)"/),
        collapsed: /(?:^|\s)lp-collapse(?:\s|$)/.test(cls),
        title: text(first(sec, /<div class="course-section__title">([\s\S]*?)<\/div>/) ?? ''),
        count: text(first(sec, /<div class="section-count-items">([\s\S]*?)<\/div>/) ?? ''),
        items: sec
          .split(/<li class="course-item\b/)
          .slice(1)
          .map((it) => ({
            id: first(it, /data-item-id="(\d+)"/),
            order: Number(first(it, /data-item-order="(\d+)"/)),
            type: first(it, /data-item-type="([^"]*)"/),
            url: attr(first(it, /<a [^>]*>/, 0), 'href'),
            number: text(first(it, /<span class="course-item-order[^"]*">([\s\S]*?)<\/span>/) ?? ''),
            title: text(first(it, /<div class="course-item-title">([\s\S]*?)<\/div>/) ?? ''),
            status: first(it, /<div class="course-item__status"><span class="course-item-ico ([^"]*)">/) ?? '',
          })),
      };
    });
  const lpBc = el(h, /<ul class="learn-press-breadcrumb">/, 'ul') ?? '';
  return {
    slug: url.replace(/\/$/, '').split('/').pop(),
    url,
    id: first(s.bodyClass, /postid-(\d+)/),
    title: text(first(h, /<h1 class="course-title">([\s\S]*?)<\/h1>/) ?? ''),
    seoTitle: s.title,
    metaDesc: s.description,
    ogImage: s.ogImage,
    published: s.articlePublished,
    modified: s.articleModified,
    instructorName: text(first(instr, /<span class="instructor-display-name">([\s\S]*?)<\/span>/) ?? ''),
    instructorAvatar: attr(first(instr, /<img[^>]*>/, 0) ?? '', 'src') ?? '',
    categories: all(cats, /<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g).map((m) => ({ url: m[1], name: text(m[2]) })),
    duration: metaVal('duration'),
    level: metaVal('level'),
    lessons: metaVal('lesson'),
    quizzes: metaVal('quiz'),
    students: metaVal('student'),
    description: descr.trim(),
    curriculumInfo: text(el(h, /<ul class="course-curriculum-info__left">/, 'ul') ?? ''),
    sections,
    author: {
      title: text(first(author, /<h4 class="author-title">([\s\S]*?)<\/h4>/) ?? ''),
      link: attr(first(author, /<h4 class="author-title"><a[^>]*>/, 0) ?? '', 'href') ?? '',
      desc: (el(author, /<div class="author-description">/) ?? '').trim(),
      avatar: attr(first(author, /<img[^>]*>/, 0) ?? '', 'src') ?? '',
    },
    previewImg: attr(preview, 'src') ?? '',
    previewAlt: dec(attr(preview, 'alt') ?? ''),
    price: text(first(h, /<div class="course-price">([\s\S]*?)<\/div>/) ?? ''),
    enrollBtn: text(first(h, /<button type="submit" class="lp-button button-enroll-course">([\s\S]*?)<\/button>/) ?? ''),
    h1count: all(h, /<h1\b/gi).length,
    lpBreadcrumb: lpBc
      .split(/<li\b[^>]*>/)
      .slice(1)
      .filter((li) => !/breadcrumb-delimiter|lp-icon-angle-right/.test(li) || /<span>/.test(li))
      .map((li) => ({ url: attr(first(li, /<a [^>]*>/, 0) ?? '', 'href'), name: text(first(li, /<span>([\s\S]*?)<\/span>/) ?? '') })),
    bcBg: s.bcBg,
    bcTitle: s.bcTitle,
  };
}

// ---------- category ----------
function categoryData(h, url, s) {
  return {
    url,
    slug: url.replace(/\/$/, '').split('/').pop(),
    name: text(first(h, /<header class="learn-press-courses-header">\s*<h1>([\s\S]*?)<\/h1>/) ?? ''),
    termId: first(s.bodyClass, /(?:^|\s)term-(\d+)(?:\s|$)/),
    seoTitle: s.title,
    metaDesc: s.description,
    count: 0,
    items: cards(h).map((c) => ({ id: c.id, thumb: c.thumb, url: c.url, title: c.title, short: c.short })),
    hasPagination: /<nav class="learn-press-pagination/.test(h),
  };
}

// ---------- main ----------
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => dec(m[1].trim()));
// Windows/NTFS directory order (case-insensitive ordinal), which is how the
// original snapshot was ordered.
const ntfsSort = (a, b) => {
  const A = a.toUpperCase();
  const B = b.toUpperCase();
  return A < B ? -1 : A > B ? 1 : 0;
};

async function main() {
  const t0 = Date.now();
  const index = locs((await get(P + '/sitemap_index.xml')).html);
  const sitemap = async (name) => {
    const u = index.find((x) => x.endsWith('/' + name + '-sitemap.xml'));
    if (!u) throw new Error('sitemap not found: ' + name);
    return locs((await get(u)).html);
  };
  const [pageUrls, catUrls, courseLocs, testiUrls, attachUrls, rsUrls, tcatUrls] = await Promise.all(
    ['page', 'course_category', 'lp_course', 'testimonials', 'attachment', 'rselements_pro', 'testimonial-category'].map(sitemap)
  );
  const courseUrls = courseLocs.filter((u) => /\/courses\/[^/]+\/$/.test(u));

  const nameOf = (u) => pathOf(u).replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'index';
  const fetchAll = (urls, opts) => Promise.all(urls.map((u) => get(u, opts).then((r) => ({ url: u, ...r }))));

  const [pages, cats, courses, testis, archive1] = await Promise.all([
    fetchAll(pageUrls),
    fetchAll(catUrls),
    fetchAll(courseUrls),
    fetchAll(testiUrls),
    get(P + '/courses/'),
  ]);
  // archive pagination (?paged=N)
  const maxPage = Math.max(1, ...all(archive1.html, /href="\?paged=(\d+)"/g).map((m) => +m[1]));
  const archivePages = [archive1, ...(await fetchAll(Array.from({ length: maxPage - 1 }, (_, i) => P + '/courses/?paged=' + (i + 2))))];
  const extras = [
    { key: '/?s=', file: 'extra/search.html', url: P + '/?s=python' },
    { key: '/404', file: 'extra/404.html', url: P + '/this-page-does-not-exist-404/', allow404: true },
    ...rsUrls.map((u) => ({ key: pathOf(u), file: 'extra/' + pathOf(u).replace(/^\/|\/$/g, '').replace(/\//g, '_') + '.html', url: u })),
    ...tcatUrls.map((u) => ({ key: pathOf(u), file: 'extra/' + pathOf(u).replace(/^\/|\/$/g, '').replace(/\//g, '_') + '.html', url: u })),
    {
      key: '/courses/python-online-training/lessons/python-introduction/',
      file: 'extra/courses__python-online-training__lessons__python-introduction.html',
      url: P + '/courses/python-online-training/lessons/python-introduction/',
    },
  ];
  const extraRes = await Promise.all(extras.map((x) => get(x.url, { allow404: x.allow404 }).then((r) => ({ ...x, ...r }))));

  // ---- build outputs ----
  const seo = {};
  const inventory = [];
  const content = {};
  const addSeo = (dir, name, r) => {
    const s = seoData(r.html, dir + '\\' + name + '.html');
    const key = s.canonical ? pathOf(s.canonical) : pathOf(r.url);
    seo[key] = seoEntry(s);
    inventory.push(inventoryData(r.html, dir, name + '.html', s.canonical || r.url, s));
    return s;
  };
  const byName = (list, prefix) =>
    list.map((r) => ({ ...r, name: (prefix || '') + nameOf(r.url) })).sort((a, b) => ntfsSort(a.name + '.html', b.name + '.html'));

  for (const r of byName(pages)) {
    addSeo('pages', r.name, r);
    content[r.name] = contentOf(r.html);
  }
  const categories = [];
  for (const r of byName(cats)) {
    const s = addSeo('categories', r.name, r);
    categories.push(categoryData(r.html, r.url, s));
  }
  const coursesOut = [];
  for (const r of byName(courses)) {
    const s = addSeo('courses', r.name, r);
    coursesOut.push(courseData(r.html, r.url, s));
  }
  for (const r of byName(testis)) addSeo('testimonials', r.name, r);
  for (const x of extraRes) seo[x.key] = seoEntry(seoData(x.html, x.file));

  const cardsOut = archivePages.flatMap((r) => cards(r.html));
  const order = cardsOut.map((c) => ({ id: c.id, url: c.url }));
  for (const c of categories) c.count = c.items.length;

  // ---- sanity checks (fail loudly instead of shipping broken data) ----
  const problems = [];
  if (!coursesOut.length) problems.push('no courses');
  for (const c of coursesOut) if (!c.id || !c.title || !c.sections.length) problems.push('course parse: ' + c.url);
  for (const c of categories) if (!c.termId || !c.name) problems.push('category parse: ' + c.url);
  if (cardsOut.length !== coursesOut.length) problems.push(`archive has ${cardsOut.length} cards but sitemap has ${coursesOut.length} courses`);
  for (const o of order) if (!coursesOut.find((c) => c.url === o.url)) problems.push('archive course missing from sitemap: ' + o.url);
  if (problems.length) {
    console.error('sync-from-wp: aborting, nothing written:\n  ' + problems.join('\n  '));
    process.exit(1);
  }

  // ---- media and tag lists (WordPress REST API) ----
  // Every media item has an attachment page and every tag an archive URL, and almost none of them
  // are in a sitemap. scripts/gen-redirects.mjs maps these old URLs to their closest page.
  const restList = async (base, fields) => {
    const out = [];
    for (let page = 1; ; page++) {
      let batch;
      try {
        batch = JSON.parse((await get(`${P}/wp-json/wp/v2/${base}?per_page=100&page=${page}&_fields=${fields}`)).html);
      } catch (e) {
        if (page === 1) throw e;
        break; // WordPress answers 400 past the last page
      }
      out.push(...batch);
      if (batch.length < 100) break;
    }
    return out;
  };
  const media = (await restList('media', 'id,slug,link,parent,title'))
    .map((m) => ({ id: m.id, slug: m.slug, link: m.link, parent: m.parent || 0, title: (m.title && m.title.rendered) || '' }))
    .sort((a, b) => a.id - b.id);
  const tags = (await restList('tags', 'id,slug,name,count')).map((t) => ({ id: t.id, slug: t.slug, name: t.name, count: t.count })).sort((a, b) => a.slug.localeCompare(b.slug));

  // ---- write ----
  const write = (f, data) => {
    const p = path.join(OUT, f);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data, null, 1));
  };
  fs.rmSync(path.join(OUT, 'content'), { recursive: true, force: true });
  write('attachments.json', attachUrls.map((loc) => ({ loc })));
  write('categories.json', categories);
  write('courses.json', coursesOut);
  write('courses-cards.json', cardsOut);
  write('courses-archive-order.json', order);
  write('seo.json', seo);
  write('seo-inventory.json', inventory);
  write('media.json', media);
  write('tags.json', tags);
  for (const [k, v] of Object.entries(content)) write('content/' + k + '.html', v);

  console.log(
    `sync-from-wp: ${coursesOut.length} courses, ${categories.length} categories, ${Object.keys(content).length} pages, ` +
      `${Object.keys(seo).length} seo entries, ${attachUrls.length} attachments -> ${OUT}\n` +
      `  ${stats.requests} HTTP GET requests${stats.cacheHits ? ` (+${stats.cacheHits} from cache)` : ''} in ${((Date.now() - t0) / 1000).toFixed(1)}s`
  );
}

main().catch((e) => {
  console.error('sync-from-wp failed:', e.message);
  process.exit(1);
});
