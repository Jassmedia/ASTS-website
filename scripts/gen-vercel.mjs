// Generates vercel.json: trailing-slash URLs (as WordPress), www -> apex, caching headers and
// the "noindex" header that keeps *.vercel.app addresses (staging, previews) out of search engines.
//
// Redirects of old URLs are NOT here: with `trailingSlash: true` a vercel.json redirect only
// matches when its source is written with the slash, and the old site has more URLs than the
// file may hold. They are answered by middleware.js through src/lib/legacy-urls.js instead.
// Run: node scripts/gen-vercel.mjs   (the output file is committed)
import fs from 'fs';

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  trailingSlash: true,
  cleanUrls: false,
  redirects: [
    // www.aststraining.com -> aststraining.com (the canonical host of the current site)
    { source: '/:path*', has: [{ type: 'host', value: 'www.aststraining.com' }], destination: 'https://aststraining.com/:path*', permanent: true },
  ],
  headers: [
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/wp-content/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    { source: '/images/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    { source: '/(.*)', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }] },
    // Only aststraining.com may be indexed: every page already names it as canonical, and any
    // *.vercel.app address (the staging URL, preview deployments) additionally says "noindex".
    { source: '/(.*)', has: [{ type: 'host', value: '.*\\.vercel\\.app' }], headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
  ],
};
fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
console.log('vercel.json written:', config.redirects.length, 'redirect,', config.headers.length, 'header rules');
