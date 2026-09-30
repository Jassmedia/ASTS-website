// Compares the visible text of a live page snapshot with the prerendered page.
import fs from 'fs';
const [,, liveFile, distFile] = process.argv;
const text = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&#8217;/g, '\u2019').replace(/&nbsp;/g, ' ').replace(/&#039;/g, "'").replace(/&#8230;/g, '\u2026').replace(/&#8211;/g, '\u2013').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
const a = text(fs.readFileSync(liveFile, 'utf8').replace(/^[\s\S]*?<body/, '<body'));
const b = text(fs.readFileSync(distFile, 'utf8').replace(/^[\s\S]*?<body/, '<body'));
const count = (arr) => arr.reduce((m, l) => (m.set(l, (m.get(l) || 0) + 1), m), new Map());
const ca = count(a), cb = count(b);
const onlyLive = [...ca].filter(([l, n]) => (cb.get(l) || 0) < n).map(([l, n]) => `${n - (cb.get(l) || 0)}x ${l}`);
const onlyNew = [...cb].filter(([l, n]) => (ca.get(l) || 0) < n).map(([l, n]) => `${n - (ca.get(l) || 0)}x ${l}`);
console.log(`live lines: ${a.length}  new lines: ${b.length}`);
console.log('--- only in LIVE ---'); onlyLive.forEach((l) => console.log('  ' + l.slice(0, 160)));
console.log('--- only in NEW ---'); onlyNew.forEach((l) => console.log('  ' + l.slice(0, 160)));
