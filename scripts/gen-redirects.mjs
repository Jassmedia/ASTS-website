// Builds src/data/redirects.js: where every old URL of the WordPress site that is not a page of the
// new site goes. Used by src/lib/legacy-urls.js (middleware.js on Vercel, the local preview server,
// scripts/build-data.mjs and scripts/check-links.mjs).
//
//   REDIRECTS  old path -> new path (301): leftover pages, media attachment pages and tag archives
//              that have a clear equivalent
//   GONE       old paths with no equivalent (410): decorative-image attachment pages, empty tag
//              archives about subjects the site no longer covers
//   plus the course slugs / aliases the pattern rules in legacy-urls.js need.
//
// Inputs are the raw WordPress snapshots (src/data/raw) and the hand-written course data, so this
// runs before scripts/build-data.mjs.  Run: node scripts/gen-redirects.mjs  (the output is committed)
import fs from 'fs';
import { LOCAL_COURSES } from '../src/data/local-courses.mjs';
import { PAGE_REDIRECTS } from '../src/data/retired-pages.mjs';

const raw = (f) => JSON.parse(fs.readFileSync('src/data/raw/' + f, 'utf8'));
const pathOf = (u) => u.replace(/^https?:\/\/[^/]+/, '') || '/';
const courses = raw('courses.json');
const cats = raw('categories.json');
const seo = raw('seo.json');
const media = raw('media.json');
const tags = raw('tags.json');

const course = (slug) => `/courses/${slug}/`;
const category = (slug) => `/courses-category/${slug}/`;
const courseSlugs = [...courses.map((c) => c.slug), ...LOCAL_COURSES.map((c) => c.slug)];

// ---- the pages that exist on the new site (redirect targets must be one of these) ----
const pages = Object.keys(seo).filter((k) => !/^\/courses\/.+|^\/courses-category\//.test(k) && !['/?s=', '/404'].includes(k) && !(k in PAGE_REDIRECTS));
const real = new Set([...pages, ...courseSlugs.map(course), ...cats.map((c) => category(c.slug))]);
const lessonPaths = new Set(courses.flatMap((c) => c.sections.flatMap((s) => s.items.map((i) => pathOf(i.url)))));

// ---- finding the closest page for an old slug (media file name or tag) ----
// "hyperion-essbase-online-training1" -> "hyperion-essbase-online-training"
const normalize = (slug) => {
  let s = slug.toLowerCase().replace(/_/g, '-');
  for (let prev = ''; prev !== s; ) {
    prev = s;
    s = s.replace(/-(png|jpe?g|gif)$/, '').replace(/-copy$/, '').replace(/-?\d+$/, '').replace(/-+$/, '');
  }
  return s;
};
const has = (s, words) => new RegExp(`(^|-)(${words})(-|$)`).test(s);

// Subjects that would otherwise match a course by accident.
const OVERRIDES = [
  ['big-?data|hdfs|mapreduce|map-reduce|sqoop|flume|oozie|pig', course('hadoop-online-training')],
  ['hadoop-admin(istration)?', course('hadoop-online-training')],
];
// Course name bases, longest first: "hyperion-essbase", "cognos-tm1", "cognos", ... "r".
const BASES = courseSlugs.map((slug) => ({ slug, base: slug.replace(/-online-training(-\d+)?$/, '') })).sort((a, b) => b.base.length - a.base.length);
// Other names the old site used for a course, and subjects with no course of their own.
const ALIASES = [
  ['essbase', course('hyperion-essbase-online-training')],
  ['fdm|fdqm|financial-data-quality-management', course('fdmee-online-training')],
  ['hyperion-financial-management|hfm', course('hfm-online-training')],
  ['hyperion-drm|drm|data-relationship-management', course('drm-data-relationship-management-online-training')],
  ['odi|oracle-data-integrat(or|ion)', course('oracle-odi-online-training')],
  ['hyperion-planning|planning', course('hyperion-planning-online-training')],
  ['hpcm|hsf|hyperion', category('hyperion')],
  ['service-now', course('servicenow-online-training')],
  ['dotnet|asp-net|c-net|c-sharp', course('dot-net-online-training')],
  ['blueprism', course('blue-prism-online-training')],
  ['deel-learning', course('deep-learning-online-training')],
  ['tm1', course('cognos-tm1-online-training')],
  ['spotfire|tibco', course('tibco-spotfire-online-training')],
  ['oracle-scm|apps-scm', course('oracle-apps-func-scm-online-training')],
  ['oracle-dba|apps-dba', course('oracle-apps-dba-online-training')],
  ['oracle-apps?-financials?(-functional)?|oracle-financials|apps-func-financials', course('oracle-apps-func-financials-online-training')],
  ['apps-technical|fusion-technical', course('oracle-apps-technical-online-training')],
  ['hrms', course('oracle-hrms-online-training')],
  ['uipath|rpa', course('rpa-uipath-online-training')],
  ['node-js|node', course('nodejs-online-training')],
  ['reactjs|react', course('react-js-online-training')],
  ['angular-js|angular', course('angularjs-online-training')],
  ['html-jquery', course('jquery-online-training')],
  ['ruby|rails', course('ruby-on-rails-online-training')],
  ['scala|akka', course('akka-with-scala-online-training')],
  ['azure', course('microsoft-azure-online-training')],
  ['gcp|google-cloud-platform', course('google-cloud-online-training')],
  ['amazon-web-services', course('aws-online-training')],
  ['boomi', course('dell-boomi-online-training')],
  ['mule|mule-soft', course('mulesoft-online-training')],
  ['dynamics|ms-crm', course('ms-dynamics-online-training')],
  ['people-soft', course('peoplesoft-online-training')],
  ['statistical|statistics', course('statistical-modelling-online-training')],
  ['social-media-marketing|social-media', course('smm-online-training')],
  ['search-engine-optimi[sz]ation', course('seo-online-training')],
  ['search-engine-marketing|adwords|ppc', course('sem-online-training')],
  ['power-?bi', course('power-bi-online-training')],
  ['qlik-view|qlik-?sense|qlik', course('qlikview-online-training')],
  ['ms-bi', course('msbi-online-training')],
  ['obiee[0-9a-z]+', course('obiee-online-training')],
  ['data-stage', course('datastage-online-training')],
  ['ab-initio', course('abinitio-online-training')],
  ['micro-strategy|microstategy', course('microstrategy-online-training-2')],
  ['etl-testing', course('etl-testing-online-training')],
  ['full-stack', course('fullstack-online-training')],
  ['core-java|advanced-java|j2ee', course('java-online-training')],
  ['machine-learning|data-science|datascience', category('datascience-ml')],
  ['cassandra|hbase|mongo-?db|mongo|nosql|couchbase|couchdb', category('devops')],
  ['pentaho|business-?objects|sap-bo|bobi|bobj|bo', category('business-intelligence-tools')],
  ['sap[a-z]*|abap|basis|fico|hana|bpc|srm|bibw|bi-bw|simple-finance', category('erp')],
  ['oracle-apps|oracle-fusion|erp', category('erp')],
  ['software-testing|manual-testing|qtp|loadrunner|testing', category('testing')],
  ['web-?site-development|ui|wordpress|html|css|javascript|programming', category('programming')],
  ['cloud-computing', category('cloud-computing')],
  ['business-intelligence|bi', category('bi')],
  ['etl|dwh|data-warehous(e|ing)', category('etl-tools')],
  ['digital-marketing', category('digital-marketing')],
  ['class-?room-training|corporate-training', '/corporate-training/'],
  ['project-support', '/project-support/'],
  ['idea-discussion', '/idea-discussion/'],
  ['online-learning|online-training|online-trainings|online-course|online-courses', '/online-training/'],
  ['contact-us|contact', '/contact/'],
  ['about-us|about', '/about-asts-training/'],
];
// Tags naming the institute itself.
const BRAND = [['asts-training|aststraining|asts', '/about-asts-training/']];

function closest(slug, { brand = false } = {}) {
  const s = normalize(slug);
  if (!s) return null;
  for (const [words, dest] of OVERRIDES) if (has(s, words)) return dest;
  // One-letter and two-letter course names ("r") only count at the start of the slug.
  const hit = BASES.find(({ base }) => (base.length <= 2 ? s === base || s.startsWith(base + '-') : has(s, base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  if (hit) return course(hit.slug);
  for (const [words, dest] of ALIASES) if (has(s, words)) return dest;
  if (brand) for (const [words, dest] of BRAND) if (has(s, words)) return dest;
  return null;
}

// ---- exact rules ----
const REDIRECTS = {};
const GONE = new Set();
const why = {}; // for the console summary
const add = (from, to, reason) => {
  if (real.has(from) || lessonPaths.has(from)) return; // never shadow a page of the new site
  if (from === to) return;
  REDIRECTS[from] = to;
  GONE.delete(from);
  why[reason] = (why[reason] || 0) + 1;
};
const gone = (from, reason) => {
  if (real.has(from) || lessonPaths.has(from) || REDIRECTS[from]) return;
  GONE.add(from);
  why[reason] = (why[reason] || 0) + 1;
};

// 1) Leftover pages (src/data/retired-pages.mjs) and old addresses of current pages.
for (const [from, to] of Object.entries(PAGE_REDIRECTS)) add(from, to, 'leftover page -> equivalent page');
add('/testimonials/', '/about-asts-training/testimonials/', 'old address of a page'); // 301 on the old site too
add('/classroom-training/', '/corporate-training/', 'old address of a page'); // linked from the old homepage, 404 there
add('/courses-2/', '/courses/', 'old address of a page'); // linked from the old Services page, 404 there

// 2) Media attachment pages: /<parent page>/<file>/, /courses/<course>/<file>/ or /<file>/.
//    Two lists: the REST API's media items, and the attachment sitemap (it holds a few the API hides).
const attachmentPages = new Map(media.map((m) => [pathOf(m.link), m.slug]));
for (const a of raw('attachments.json')) {
  const p = pathOf(a.loc);
  if (!attachmentPages.has(p)) attachmentPages.set(p, p.split('/').filter(Boolean).pop());
}
for (const [p, slug] of attachmentPages) {
  const m = { slug };
  const parts = p.split('/').filter(Boolean);
  const parent = parts.length > 1 ? '/' + parts.slice(0, -1).join('/') + '/' : null;
  const byName = closest(m.slug);
  if (parent && parent !== '/homepage/' && (real.has(parent) || PAGE_REDIRECTS[parent])) add(p, PAGE_REDIRECTS[parent] || parent, 'attachment -> the page it is attached to');
  else if (byName) add(p, byName, 'attachment -> page matching its name');
  else gone(p, 'attachment with no equivalent (410)');
}

// 3) Tag archives (all empty: the site has no posts).
for (const t of tags) {
  const p = `/tag/${t.slug}/`;
  const dest = closest(t.slug, { brand: true });
  if (dest) add(p, dest, 'tag -> page matching its name');
  else gone(p, 'tag with no equivalent (410)');
}
// The only post category, also empty.
gone('/category/uncategorized/', 'empty archive (410)');
gone('/uncategorized/', 'empty archive (410)');

// ---- data for the pattern rules ----
// Short root-level names the old site redirected to a course (/arcs/, /python/, ...).
const COURSE_ALIASES = {
  arcs: 'arcs-online-training',
  epbcs: 'epbcs-online-training',
  pbcs: 'pbcs-online-training',
  sas: 'sas-online-training',
  sem: 'sem-online-training',
  python: 'python-online-training',
  'hyperion-planning': 'hyperion-planning-online-training',
  'microsoft-azure': 'microsoft-azure-online-training',
  'salesforce-crm': 'salesforce-crm-online-training',
};
// /instructor/<name>/: the instructor (author) link of each course is /<course>/<name>/.
const INSTRUCTORS = {};
for (const c of courses) {
  const parts = pathOf((c.author && c.author.link) || '').split('/').filter(Boolean);
  if (parts.length === 2 && !INSTRUCTORS[parts[1]]) INSTRUCTORS[parts[1]] = c.slug;
}
// First path segments that belong to real pages or to WordPress: never guessed as a course name.
const RESERVED = [...new Set([...[...real].map((p) => p.split('/')[1]).filter(Boolean), 'wp-admin', 'wp-content', 'wp-includes', 'wp-json', 'feed', 'comments', 'assets', 'images', 'tag', 'category', 'author', 'page', 'lessons', 'quizzes', 'instructor', 'course', 'homepage'])].sort();

// ---- checks: no loops, no chains, every target exists ----
const problems = [];
for (const [from, to] of Object.entries(REDIRECTS)) {
  if (!real.has(to)) problems.push(`${from} -> ${to}: target is not a page of the new site`);
  if (REDIRECTS[to]) problems.push(`${from} -> ${to}: target is itself redirected (chain)`);
  if (GONE.has(to)) problems.push(`${from} -> ${to}: target is marked gone`);
  if (!from.startsWith('/') || !from.endsWith('/')) problems.push(`${from}: source must start and end with "/"`);
}
for (const slug of [...Object.values(COURSE_ALIASES), ...Object.values(INSTRUCTORS)]) if (!courseSlugs.includes(slug)) problems.push(`alias target is not a course: ${slug}`);
if (problems.length) {
  console.error('gen-redirects: aborting, nothing written:\n  ' + problems.slice(0, 30).join('\n  '));
  process.exit(1);
}

const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(
  'src/data/redirects.js',
  '// Generated by scripts/gen-redirects.mjs: do not edit.\n' +
    `export const REDIRECTS = ${JSON.stringify(sorted(REDIRECTS), null, 1)};\n` +
    `export const GONE = ${JSON.stringify([...GONE].sort(), null, 1)};\n` +
    `export const COURSE_SLUGS = ${JSON.stringify(courseSlugs)};\n` +
    `export const COURSE_ALIASES = ${JSON.stringify(sorted(COURSE_ALIASES))};\n` +
    `export const INSTRUCTORS = ${JSON.stringify(sorted(INSTRUCTORS))};\n` +
    `export const RESERVED = ${JSON.stringify(RESERVED)};\n`,
);
console.log(`src/data/redirects.js: ${Object.keys(REDIRECTS).length} redirects, ${GONE.size} gone, ${courseSlugs.length} course slugs, ${Object.keys(INSTRUCTORS).length} instructor names`);
for (const [k, v] of Object.entries(why)) console.log(`  ${String(v).padStart(4)}  ${k}`);
if (process.argv.includes('--list-gone')) console.log([...GONE].sort().join('\n'));
