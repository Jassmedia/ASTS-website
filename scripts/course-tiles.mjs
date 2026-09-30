// Renders the course card images: one tile per course in src/data/trending-courses.js, written to
// public/images/courses/<id>.webp. Each tile is a navy panel in the site's colours showing the
// course's own name, so every card image matches its course. Re-run after changing the course list.
// Run: npm run gen:course-tiles   (needs Chrome; set CHROME_PATH if it is not installed in the usual place)
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { TRENDING_COURSES } from '../src/data/trending-courses.js';

const OUT = 'public/images/courses';
const W = 1000; // 5:3, the ratio of the course card image area
const H = 600;
// One accent per card, in list order (repeats after 8).
const ACCENTS = ['#3B82F6', '#EF4444', '#21A7D0', '#E0529C', '#7C5CFF', '#22B07D', '#F97316', '#F5A524'];

const font = (pkg, file) => pathToFileURL(path.resolve('node_modules/@fontsource', pkg, 'files', file)).href;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) throw new Error('Chrome not found: set CHROME_PATH');
  return found;
}

// "Python Online Training" -> big "Python" + "Online Training" underneath.
function labels(title) {
  const m = /^(.*?)\s+(online training)$/i.exec(title.trim());
  return m ? [m[1], 'Online Training'] : [title.trim(), 'Online Training'];
}

function tileHtml(course, accent) {
  const [name, sub] = labels(course.title);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Jakarta;font-weight:800;src:url(${font('plus-jakarta-sans', 'plus-jakarta-sans-latin-800-normal.woff2')})}
@font-face{font-family:Jakarta;font-weight:700;src:url(${font('plus-jakarta-sans', 'plus-jakarta-sans-latin-700-normal.woff2')})}
@font-face{font-family:Inter;font-weight:500;src:url(${font('inter', 'inter-latin-500-normal.woff2')})}
html,body{margin:0;background:#0b1f3a}
.tile{--a:${accent};position:relative;width:${W}px;height:${H}px;overflow:hidden;color:#fff;font-family:Inter,sans-serif;
  background:radial-gradient(560px 420px at 92% 0%,color-mix(in srgb,var(--a) 55%,transparent),transparent 72%),
  radial-gradient(520px 380px at 0% 100%,rgba(33,167,208,.20),transparent 70%),
  linear-gradient(135deg,#0b1f3a 0%,#12294b 55%,#0b1f3a 100%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);
  background-size:50px 50px;-webkit-mask-image:radial-gradient(circle at 85% 15%,#000 0%,transparent 70%);mask-image:radial-gradient(circle at 85% 15%,#000 0%,transparent 70%)}
.glyph{position:absolute;right:-40px;bottom:-70px;width:470px;height:470px;color:var(--a);opacity:.2}
.inner{position:absolute;inset:60px 72px 66px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;justify-content:space-between}
.icon{width:76px;height:76px;border-radius:20px;background:var(--a);display:grid;place-items:center;box-shadow:0 16px 36px color-mix(in srgb,var(--a) 45%,transparent)}
.icon svg{width:40px;height:40px;color:#fff}
.brand{font:700 22px Jakarta,sans-serif;letter-spacing:.24em;color:rgba(255,255,255,.55)}
h1{margin:0;font:800 104px/1.04 Jakarta,sans-serif;letter-spacing:-.02em;white-space:nowrap}
.sub{margin-top:16px;font:500 36px Inter,sans-serif;color:rgba(255,255,255,.74)}
.bar{margin-top:26px;width:128px;height:7px;border-radius:7px;background:var(--a)}
</style></head><body><div class="tile">
<div class="grid"></div>
<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/><path d="m14.5 4-5 16"/></svg>
<div class="inner">
  <div class="top">
    <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg></div>
    <div class="brand">ASTS</div>
  </div>
  <div><h1>${esc(name)}</h1><div class="sub">${esc(sub)}</div><div class="bar"></div></div>
</div></div>
<script>
  // Shrink long names to fit one line; wrap to two only if still too wide at the smallest size.
  document.fonts.ready.then(() => {
    const h = document.querySelector('h1'), max = ${W} - 144;
    let s = 104;
    while (h.scrollWidth > max && s > 72) h.style.fontSize = (s -= 2) + 'px';
    if (h.scrollWidth > max) { h.style.whiteSpace = 'normal'; h.style.maxWidth = max + 'px'; }
    document.body.dataset.ready = '1';
  });
</script></body></html>`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'course-tiles-'));
  const port = 9400 + Math.floor(Math.random() * 400);
  const chrome = spawn(findChrome(), ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(tmp, 'profile')}`, '--hide-scrollbars', `--window-size=${W},${H}`, 'about:blank']);
  try {
    let targets;
    for (let i = 0; !targets && i < 60; i++) {
      try {
        targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      } catch {
        await sleep(200);
      }
    }
    const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
    let id = 0;
    const pending = new Map();
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (pending.has(d.id)) pending.get(d.id)(d), pending.delete(d.id);
    };
    const send = (method, params = {}) =>
      new Promise((r) => {
        pending.set(++id, r);
        ws.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value;

    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    for (const [i, course] of TRENDING_COURSES.entries()) {
      const file = path.join(tmp, `${course.id}.html`);
      fs.writeFileSync(file, tileHtml(course, ACCENTS[i % ACCENTS.length]));
      await send('Page.navigate', { url: pathToFileURL(file).href });
      for (let t = 0; t < 100 && (await evaluate('document.body && document.body.dataset.ready')) !== '1'; t++) await sleep(50);
      const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 90, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
      const out = path.join(OUT, `${course.id}.webp`);
      fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
      console.log(`${out}  (${course.title})`);
    }
    ws.close();
  } finally {
    const exited = new Promise((r) => chrome.once('exit', r));
    chrome.kill();
    await Promise.race([exited, sleep(3000)]);
    try {
      fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
    } catch {
      // Chrome's helper processes can hold the profile a moment longer; it is only a temp folder.
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
