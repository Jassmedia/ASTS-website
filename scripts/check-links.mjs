// Verifies every internal link in the prerendered HTML goes straight to a page or file of the
// site: not to an old URL that redirects (src/lib/legacy-urls.js), not to a URL without its
// trailing slash, and not to a 404. Links WordPress answers (wp-login, feeds, search, ...) pass.
// Run after `npm run build`: node scripts/check-links.mjs [distDir]   (exit code 1 on any finding)
import fs from 'fs';
import path from 'path';
import { resolveLegacyUrl } from '../src/lib/legacy-urls.js';
import { isWordPressPath, hasWordPressQuery } from '../src/lib/wp-routing.js';

const dist = process.argv[2] || 'dist';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const pages = walk(dist).filter((f) => f.endsWith('.html'));
const isFile = (f) => fs.existsSync(f) && fs.statSync(f).isFile();

/** 'ok' | 'redirect' | 'gone' | 'no-slash' | 'missing' */
function classify(href) {
  const u = new URL(href, 'https://aststraining.com');
  if (isWordPressPath(u.pathname) || hasWordPressQuery(u.searchParams)) return 'ok';
  let rel;
  try {
    rel = decodeURIComponent(u.pathname).replace(/^\//, '');
  } catch {
    return 'missing';
  }
  if (rel === '') return 'ok';
  if (u.pathname.endsWith('/')) {
    if (isFile(path.join(dist, rel, 'index.html'))) return 'ok';
  } else {
    if (isFile(path.join(dist, rel))) return 'ok';
    if (isFile(path.join(dist, rel, 'index.html'))) return 'no-slash';
  }
  const legacy = resolveLegacyUrl(u.pathname);
  if (legacy) return legacy.redirect ? 'redirect' : 'gone';
  return 'missing';
}

const findings = { redirect: new Map(), gone: new Map(), 'no-slash': new Map(), missing: new Map() };
let total = 0;
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<a\b[^>]*?\bhref="([^"]*)"/g)) {
    let h = m[1].replace(/&amp;/g, '&');
    if (!h || /^(mailto:|tel:|javascript:|#)/i.test(h)) continue;
    if (/^(https?:)?\/\//i.test(h)) {
      if (!/^(https?:)?\/\/(www\.)?aststraining\.com(\/|$)/i.test(h)) continue;
      h = h.replace(/^(https?:)?\/\/(www\.)?aststraining\.com/i, '') || '/';
    }
    if (!h.startsWith('/')) continue; // relative fragment such as "?paged=2"
    total++;
    const kind = classify(h);
    if (kind === 'ok') continue;
    const key = h.replace(/#.*$/, '');
    if (!findings[kind].has(key)) findings[kind].set(key, []);
    findings[kind].get(key).push(f.split(path.sep).join('/').replace(dist + '/', '/').replace(/index\.html$/, ''));
  }
}
const count = Object.values(findings).reduce((n, m) => n + m.size, 0);
console.log(`internal links checked: ${total} on ${pages.length} pages | targets with a problem: ${count}`);
for (const [kind, map] of Object.entries(findings)) {
  if (!map.size) continue;
  console.log(`\n${kind} (${map.size}):`);
  for (const [k, from] of [...map].slice(0, 40)) console.log(`  ${k}   <- ${from[0]}${from.length > 1 ? ` (+${from.length - 1} more pages)` : ''}`);
}
process.exit(count ? 1 : 0);
