// Generates vercel.json: trailing-slash URLs (as WordPress), www -> apex, and
// the 301 redirects that keep every legacy URL of the current site working.
// Run: node scripts/gen-vercel.mjs   (the output file is committed)
import fs from 'fs';
import path from 'path';
import { listRoutes } from './routes-list.mjs';

const j = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const coursesIndex = j('src/data/courses-index.json');
const attachments = j('src/data/attachments.json');
const routes = new Set(listRoutes().map((r) => r.replace(/\/$/, '') || '/'));

const redirects = [];
const add = (source, destination, permanent = true) => redirects.push({ source, destination, permanent });

// 1) www.aststraining.com -> aststraining.com (the canonical host of the current site)
redirects.push({ source: '/:path*', has: [{ type: 'host', value: 'www.aststraining.com' }], destination: 'https://aststraining.com/:path*', permanent: true });

// 2) Legacy flat course URLs (/python-online-training/ etc.) 301 to /courses/<slug>/ on the current site.
//    Instructor/author links under a course slug (/<course>/<name>/) also resolve to the course page.
for (const c of coursesIndex) {
  if (routes.has('/' + c.slug)) continue; // never shadow a real page
  add(`/${c.slug}`, `/courses/${c.slug}/`);
  add(`/${c.slug}/:rest*`, `/courses/${c.slug}/`);
}

// 3) Old short slugs that the current site redirects to a course page
const SHORT = {
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
for (const [from, to] of Object.entries(SHORT)) {
  if (routes.has('/' + from)) continue;
  add(`/${from}`, `/courses/${to}/`);
  add(`/${from}/:rest*`, `/courses/${to}/`);
}

// 4) Links that exist on the current site but lead to missing pages there (404): sent to the matching page
add('/classroom-training', '/corporate-training/');
add('/classroom-training/:rest*', '/corporate-training/');
add('/courses-2', '/courses/');
add('/courses-2/:rest*', '/courses/');

// 5) WordPress login/admin links (LearnPress "login" links): the site has no login; the current header's login icon goes to Contact
add('/wp-login.php', '/contact/', false);
add('/wp-admin', '/contact/', false);
add('/wp-admin/:rest*', '/contact/', false);

// 6) WordPress media "attachment" pages -> their parent page
for (const a of attachments) {
  const parts = a.replace(/\/$/, '').split('/').filter(Boolean);
  parts.pop();
  let parent = '/' + parts.join('/');
  if (parent === '/homepage') parent = '/';
  if (!routes.has(parent) && !routes.has(parent + '/')) parent = '/';
  add(a.replace(/\/$/, ''), parent === '/' ? '/' : parent + '/');
}

// 7) Old WordPress feed URLs referenced in the current site's <head>
add('/feed', '/', false);
add('/comments/feed', '/', false);

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  trailingSlash: true,
  cleanUrls: false,
  redirects,
  headers: [
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/wp-content/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    { source: '/(.*)', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }] },
  ],
};
fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
console.log('vercel.json written with', redirects.length, 'redirects');
