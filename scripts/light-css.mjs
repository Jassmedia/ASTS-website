// Runs after prerendering. Pages built only from the redesign (the homepage; `lightCss` in
// src/routes.jsx) do not load the old theme's stylesheet bundle, which is far larger than the page
// needs. They still rely on a small part of it (the CSS reset, icon fonts, the floating social bar),
// so this script extracts exactly the rules of that bundle that match the page's own HTML into a
// small stylesheet and links it from the page, ahead of the redesign stylesheet. Rules are kept
// whole and in their original order, so the page looks exactly as it does with the full bundle.
// Run: node scripts/light-css.mjs [distDir]
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import postcss from 'postcss';
import * as cheerio from 'cheerio';

const dist = process.argv[2] || 'dist';
const LIGHT_PAGES = ['index.html'];

// State pseudo-classes and pseudo-elements say nothing about whether the element exists.
const PSEUDO =
  /::?(before|after|first-letter|first-line|placeholder|selection|marker|backdrop|file-selector-button|-webkit-[a-z-]+|-moz-[a-z-]+|-ms-[a-z-]+)|:(hover|focus-within|focus-visible|focus|active|visited|link|checked|disabled|enabled|target|invalid|valid|required|optional|read-only|read-write|placeholder-shown|indeterminate|default|empty|root)(?![a-z-])/gi;

function makeMatcher($) {
  const cache = new Map();
  return (selector) => {
    if (cache.has(selector)) return cache.get(selector);
    let s = selector.replace(PSEUDO, '').replace(/:not\(\s*\)/g, '').trim();
    if (!s || /[>+~]$/.test(s)) s += '*';
    s = s.replace(/^([>+~])/, '* $1').replace(/([>+~])\s*(?=[>+~,)]|$)/g, '$1 *');
    let hit;
    try {
      hit = $(s).length > 0;
    } catch {
      hit = true; // a selector the matcher cannot parse is kept
    }
    cache.set(selector, hit);
    return hit;
  };
}

function extract(css, html) {
  const $ = cheerio.load(html);
  const matches = makeMatcher($);
  const root = postcss.parse(css);
  // 1) style rules: keep those with at least one selector that matches the page
  root.walkRules((rule) => {
    if (rule.parent && rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    if (!rule.selectors.some(matches)) rule.remove();
  });
  // 2) @font-face / @keyframes: keep those the remaining rules refer to
  const used = [];
  root.walkDecls(/^(font|font-family|animation|animation-name)$/i, (d) => {
    if (!(d.parent && d.parent.type === 'atrule' && d.parent.name === 'font-face')) used.push(d.value.toLowerCase());
  });
  const refers = (name) => {
    const n = name.replace(/["']/g, '').trim().toLowerCase();
    return n && used.some((v) => v.includes(n));
  };
  root.walkAtRules((at) => {
    if (at.name === 'font-face') {
      let family = '';
      at.walkDecls('font-family', (d) => (family = d.value));
      if (!refers(family)) at.remove();
    } else if (/keyframes$/i.test(at.name)) {
      if (!refers(at.params)) at.remove();
    }
  });
  // 3) drop conditional groups that ended up empty
  for (let changed = true; changed; ) {
    changed = false;
    root.walkAtRules((at) => {
      if (/^(media|supports|layer|document)$/i.test(at.name) && at.nodes && at.nodes.length === 0) {
        at.remove();
        changed = true;
      }
    });
  }
  root.walkComments((c) => c.remove());
  return root.toString();
}

for (const page of LIGHT_PAGES) {
  const file = path.join(dist, page);
  let html = fs.readFileSync(file, 'utf8');
  // The light page only prefetches the theme bundle; that link names the built file.
  const prefetch = /<link[^>]*rel="prefetch"[^>]*href="(\/assets\/index-[^"]+\.css)"[^>]*>/.exec(html);
  const redesign = /<link[^>]*rel="stylesheet"[^>]*href="\/assets\/redesign-[^"]+\.css"[^>]*>/.exec(html);
  if (!prefetch || !redesign) throw new Error(`light-css: ${page} does not look like a light page (no theme prefetch / redesign stylesheet link)`);
  const bundle = fs.readFileSync(path.join(dist, prefetch[1]), 'utf8');
  const css = extract(bundle, html);
  const name = `light-${path.basename(page, '.html')}-${crypto.createHash('sha256').update(css).digest('hex').slice(0, 8)}.css`;
  fs.writeFileSync(path.join(dist, 'assets', name), css);
  html = html.replace(redesign[0], `<link rel="stylesheet" href="/assets/${name}"/>\n    ${redesign[0]}`);
  fs.writeFileSync(file, html);
  console.log(`light-css: ${page}: ${(css.length / 1024).toFixed(0)} KB of the ${(bundle.length / 1024).toFixed(0)} KB theme bundle -> /assets/${name}`);
}
