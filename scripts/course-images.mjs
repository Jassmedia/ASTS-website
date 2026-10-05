// Draws the course images of the courses in src/data/local-courses.mjs (which have no image in
// WordPress) in the style of the existing course images such as FCCS: a light panel with the course
// name in large letters and the full product name underneath. No third-party logos are used.
// Writes public/images/courses/<slug>.webp (1000x600), the course's card and page image.
// Run: npm run gen:course-images   (needs Chrome; set CHROME_PATH if it is not installed in the usual place)
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { LOCAL_COURSES } from '../src/data/local-courses.mjs';
import { COURSE_IMAGE_OVERRIDES } from '../src/data/course-images.mjs';

// Local courses plus the WordPress courses that use a drawn name image (src/data/course-images.mjs).
const IMAGES = [...LOCAL_COURSES.map((c) => ({ slug: c.slug, image: c.image })), ...Object.entries(COURSE_IMAGE_OVERRIDES).map(([slug, image]) => ({ slug, image }))];

const OUT = 'public/images/courses';
const W = 1000; // 5:3, the ratio of the course card image area
const H = 600;

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

function imageHtml({ title, subtitle }) {
  // Acronyms (FCCS style) are letter-spaced; names in words are not.
  const acronym = !/\s/.test(title) && title === title.toUpperCase();
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Jakarta;font-weight:800;src:url(${font('plus-jakarta-sans', 'plus-jakarta-sans-latin-800-normal.woff2')})}
@font-face{font-family:Inter;font-weight:500;src:url(${font('inter', 'inter-latin-500-normal.woff2')})}
html,body{margin:0;background:#f6f7f9}
.img{width:${W}px;height:${H}px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f6f7f9;color:#141b26;text-align:center}
h1{margin:0;font:800 150px/1.05 Jakarta,sans-serif;letter-spacing:${acronym ? '.08em' : '-.01em'};white-space:nowrap}
.rule{width:560px;max-width:84%;height:3px;margin:34px 0 30px;background:#141b26}
.sub{font:500 38px/1.3 Inter,sans-serif;color:#3a4454;white-space:nowrap}
.bar{width:96px;height:8px;margin-top:34px;border-radius:8px;background:#21a7d0}
</style></head><body><div class="img">
<h1>${esc(title)}</h1><div class="rule"></div><div class="sub">${esc(subtitle)}</div><div class="bar"></div>
</div>
<script>
  // Shrink long names and product names to fit one line.
  document.fonts.ready.then(() => {
    const h = document.querySelector('h1'), sub = document.querySelector('.sub'), max = ${W} - 140;
    let s = 150;
    while (h.scrollWidth > max && s > 60) h.style.fontSize = (s -= 2) + 'px';
    let t = 38;
    while (sub.scrollWidth > max && t > 26) sub.style.fontSize = (t -= 1) + 'px';
    document.body.dataset.ready = '1';
  });
</script></body></html>`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'course-images-'));
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
    for (const course of IMAGES) {
      if (!course.image) throw new Error(`${course.slug}: no image text in local-courses.mjs`);
      const file = path.join(tmp, `${course.slug}.html`);
      fs.writeFileSync(file, imageHtml(course.image));
      await send('Page.navigate', { url: pathToFileURL(file).href });
      for (let t = 0; t < 100 && (await evaluate('document.body && document.body.dataset.ready')) !== '1'; t++) await sleep(50);
      const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 90, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
      const out = path.join(OUT, `${course.slug}.webp`);
      fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
      console.log(`${out}  (${course.image.title})`);
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
