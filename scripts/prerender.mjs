// Pre-renders every route of the site into static HTML files under dist/
// (dist/<path>/index.html), so each URL is served as complete HTML with its
// own title, meta tags, canonical URL and JSON-LD, then hydrated by React.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { listRoutes } from './routes-list.mjs';

const dist = 'dist';
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href);

const routes = listRoutes();
let done = 0;
const started = Date.now();
for (const url of routes) {
  const { html, helmet } = await render(url);
  const head = [helmet.title.toString(), helmet.meta.toString(), helmet.link.toString(), helmet.style.toString(), helmet.script.toString()]
    .filter(Boolean)
    .join('\n    ');
  const bodyAttrs = helmet.bodyAttributes.toString();
  // Head tags go at the end of <head> so the page stylesheet links (managed by
  // Helmet) come after everything else, matching the client-side order.
  const page = template
    .replace('<!--app-head-->', '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<!--app-html-->', html)
    .replace('<body>', bodyAttrs ? `<body ${bodyAttrs}>` : '<body>');
  const file = url === '/404' ? path.join(dist, '404.html') : path.join(dist, url, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page);
  done++;
  if (done % 100 === 0) console.log(`prerendered ${done}/${routes.length}`);
}
console.log(`prerendered ${done} pages in ${((Date.now() - started) / 1000).toFixed(1)}s`);
