// Verifies every internal link in the prerendered HTML resolves to a prerendered
// page, a static file, or a redirect rule in vercel.json.
// Run after `npm run build`: node scripts/check-links.mjs
import fs from 'fs';
import path from 'path';

const dist = 'dist';
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const exactSources = new Set(vercel.redirects.filter((r) => !/:rest\*|:path\*/.test(r.source)).map((r) => r.source));
const prefixSources = vercel.redirects.filter((r) => /\/:rest\*$/.test(r.source)).map((r) => r.source.replace(/\/:rest\*$/, ''));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const pages = walk(dist).filter((f) => f.endsWith('.html'));

const exists = (p) => {
  const clean = p.replace(/[?#].*$/, '');
  if (clean === '/' || clean === '') return true;
  const rel = clean.replace(/^\//, '').replace(/\/$/, '');
  if (fs.existsSync(path.join(dist, rel, 'index.html'))) return true;
  if (fs.existsSync(path.join(dist, rel)) && fs.statSync(path.join(dist, rel)).isFile()) return true;
  if (exactSources.has('/' + rel) || exactSources.has('/' + rel + '/')) return true;
  if (prefixSources.some((p) => ('/' + rel).startsWith(p + '/'))) return true;
  return false;
};

const broken = new Map();
let total = 0;
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<a[^>]+href="([^"]+)"/g)) {
    let h = m[1];
    if (/^(mailto:|tel:|javascript:|#)/.test(h)) continue;
    if (/^https?:\/\//.test(h)) {
      if (!/aststraining\.com/.test(h)) continue;
      h = h.replace(/^https?:\/\/(www\.)?aststraining\.com/, '') || '/';
    }
    total++;
    if (!exists(h)) {
      const k = h.replace(/[?#].*$/, '');
      if (!broken.has(k)) broken.set(k, f);
    }
  }
}
console.log('internal links checked:', total, '| pages:', pages.length, '| unresolved targets:', broken.size);
for (const [k, f] of [...broken].slice(0, 40)) console.log('  ', k, ' (first seen in', f.split(path.sep).join('/').replace('dist/', ''), ')');
