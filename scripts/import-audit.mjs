// One-off: copies audited assets/data from the scratchpad mirror into the project.
import fs from 'fs'; import path from 'path';
const A = process.argv[2];
const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, {withFileTypes:true}).flatMap(e => e.isDirectory()? walk(path.join(d,e.name)) : [path.join(d,e.name)]) : [];
const cp = (src, dst) => { fs.mkdirSync(path.dirname(dst), {recursive:true}); fs.copyFileSync(src, dst); };
let n=0;
// 1) uploads (images) -> public/wp-content/uploads (preserve URLs). Skip elementor css dir.
for (const f of walk(path.join(A,'site/wp-content/uploads'))) {
  const rel = path.relative(path.join(A,'site'), f).split(path.sep).join('/');
  if (rel.startsWith('wp-content/uploads/elementor/css')) continue;
  cp(f, path.join('public', rel)); n++;
}
console.log('uploads copied:', n); n=0;
// 2) vendor css/fonts/images (no js) -> src/styles/vendor/<rel>
for (const dir of ['site/wp-content/plugins','site/wp-content/themes','site/wp-includes','site/wp-content/uploads/elementor/css']) {
  for (const f of walk(path.join(A,dir))) {
    if (/\.js$/i.test(f)) continue;
    const rel = path.relative(path.join(A,'site'), f).split(path.sep).join('/');
    cp(f, path.join('src/styles/vendor', rel)); n++;
  }
}
console.log('vendor files copied:', n);
// plugin images that are referenced from HTML (not css): elementor placeholder
cp(path.join(A,'site/wp-content/plugins/elementor/assets/images/placeholder.png'), 'public/wp-content/plugins/elementor/assets/images/placeholder.png');
// 3) inline style blocks -> src/styles/inline/NN-id.css
const home = fs.readFileSync(path.join(A,'home.html'),'utf8');
const blocks = [...home.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)];
const blockNames = [];
blocks.forEach((b,i)=>{ const id=(b[1].match(/id=['"]([^'"]+)/)||['','noid'])[1]; const name=String(i).padStart(2,'0')+'-'+id+'.css'; blockNames.push(name); fs.mkdirSync('src/styles/inline',{recursive:true}); fs.writeFileSync(path.join('src/styles/inline',name), b[2].replace(/\/\*# sourceURL=[^*]*\*\//g,'')); });
console.log('inline blocks:', blockNames.join(', '));
// 4) vendor.css in the live load order (home), google fonts excluded (they go in index.html)
const order = fs.readFileSync(path.join(A,'css-order-home.txt'),'utf8').split(/\r?\n/).filter(Boolean);
let si=0; const lines=['/* Global stylesheet: the live site\'s stylesheets in their exact load order (see audit css-order-home.txt). */'];
for (const o of order) {
  if (o.startsWith('LINK ')) {
    const p=o.slice(5); if (/fonts\.googleapis/.test(p)) { lines.push('/* google font link handled in index.html: '+p.slice(0,80)+' */'); continue; }
    if (p.endsWith('post-1844.css')) { lines.push('/* post-1844.css is missing (HTTP 404) on the live site, so it is intentionally not loaded here either */'); 
      for (const id of [11,144,146,148,150,152,154,156,158,2271]) lines.push(`@import './vendor/wp-content/uploads/elementor/css/post-${id}.css';`);
      continue; }
    if (!fs.existsSync(path.join('src/styles/vendor',p))) { lines.push('/* missing: '+p+' */'); continue; }
    lines.push(`@import './vendor/${p}';`);
  } else { const name=blockNames[si++]; lines.push(`@import './inline/${name}';`); }
}
fs.writeFileSync('src/styles/vendor.css', lines.join('\n')+'\n');
fs.writeFileSync('src/styles/learnpress.css', ["/* Loaded only on LearnPress routes (courses, categories, course items, lp pages), as on the live site. */","@import './vendor/wp-content/plugins/learnpress/assets/css/learnpress.min.css';","@import './vendor/wp-content/plugins/learnpress-course-review/assets/dist/css/course-review.min.css';",""].join('\n'));
fs.writeFileSync('src/styles/learnpress-instructors.css', ["@import './vendor/wp-content/plugins/learnpress/assets/css/instructors.min.css';","@import './vendor/wp-content/plugins/learnpress/assets/css/instructor.min.css';",""].join('\n'));
fs.writeFileSync('src/styles/shortcodes-ultimate.css', ["@import './vendor/wp-content/plugins/shortcodes-ultimate/includes/css/shortcodes.css';","@import './vendor/wp-content/plugins/shortcodes-ultimate/includes/css/icons.css';",""].join('\n'));
// 5) data
fs.mkdirSync('src/data/raw',{recursive:true});
for (const f of ['courses.json','categories.json','seo-inventory.json','courses-archive-order.json','attachments.json']) cp(path.join(A,f), path.join('src/data/raw',f));
for (const f of walk(path.join(A,'content'))) cp(f, path.join('src/data/raw/content', path.basename(f)));
console.log('data copied'); 
console.log(fs.readFileSync('src/styles/vendor.css','utf8'));
