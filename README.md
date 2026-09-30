# ASTS Training website (React / Vite front end + WordPress backend)

A 1:1 technical migration of https://aststraining.com/ (WordPress + Educavo theme + Elementor +
LearnPress + Slider Revolution). The visual design, page structure, navigation, URLs, content,
images and SEO metadata are reproduced from the current site; only the front-end technology changes.

WordPress stays as the backend (headless CMS): content is edited in wp-admin as today, and every
dynamic feature keeps running in WordPress (accounts, LearnPress enrolment/checkout/profile/lessons,
comments, Contact Form 7 email, search, feeds, Yoast sitemaps, REST API). See "Architecture".

## Architecture

```
visitor ── https://aststraining.com ──> Vercel
                                          │
             middleware.js decides (src/lib/wp-routing.js):
             ├─ prerendered page, image, asset ─────────────> static file from dist/  (React hydrates)
             └─ WordPress request ──> server/wp-proxy.js ──> WordPress (WP_ORIGIN)
                 · logged-in visitors (wordpress_logged_in_* cookie): every page
                 · POST/PUT/DELETE (Contact Form 7, comments, enrolment, reviews, wp-admin)
                 · /wp-login.php, /wp-admin/, /wp-json/, /wp-includes/, plugin/theme files,
                   /lp-ajax-handle, /lp-checkout/, feeds, Yoast sitemaps
                 · WordPress query URLs (?s= search, ?p=, ?unapproved=, ...)
                 · any URL without a prerendered file (vercel.json fallback rewrite -> api/wp.js):
                   attachment pages, legacy URLs WordPress redirects, WordPress' own 404
```

- Front end: React 18 + React Router 6, Vite 6, prerendered to static HTML for every URL
  (`scripts/prerender.mjs`, 1,091 pages). The theme's stylesheets are ported verbatim.
- Forms post to Contact Form 7's REST endpoint, so WordPress validates and sends the emails with the
  site's existing CF7 mail settings (`src/components/forms/Cf7Form.jsx`, `src/lib/cf7.js`).
- Course "Start Now", the Reviews tab and comments call the same LearnPress / WordPress endpoints as
  the live site's scripts (`CourseSidebar.jsx`, `LpAjaxElement.jsx`, `CommentForm.jsx`).
- Content: `npm run sync` pulls the current content from WordPress (read-only GETs) into
  `src/data/raw/` and regenerates `src/data/`. Run it before every production build (and from a
  Vercel Deploy Hook triggered by WordPress on publish) so wp-admin edits reach the static pages.

## Project layout

```
middleware.js                Vercel Routing Middleware: sends WordPress requests to the proxy
api/wp.js                    fallback for URLs without a prerendered file (WordPress answers)
server/wp-proxy.js           same-domain reverse proxy to WordPress (Fetch API; edge + Node)
server/vite-wp-proxy.js      the same routing/proxy for `npm run dev` and `npm run preview`
src/lib/wp-routing.js        the routing rules (shared by all of the above and the in-page link handler)
wordpress/mu-plugins/        must-use plugin to install on WordPress at the domain switch
public/wp-content/uploads/   the current site's images, at their original URLs
scripts/                     content sync, data generation, prerender, sitemap, vercel.json generation
src/components/ src/pages/   page components; src/layouts/MainLayout.jsx page chrome
src/data/                    generated JSON (courses, categories, pages, testimonials, SEO)
src/data/raw/                content pulled from WordPress (npm run sync)
```

## Commands

```bash
npm install
npm run sync         # pull current content from WordPress + regenerate src/data (read-only)
npm run build        # client build + SSR build + prerender + fallback sitemaps  -> dist/
npm run dev          # dev server; WordPress requests are proxied to WP_ORIGIN
npm run preview      # serve dist/ with the same WordPress proxy
node scripts/check-links.mjs  # verify internal links in dist/
node scripts/gen-vercel.mjs   # regenerate vercel.json (redirects + WordPress fallback rewrite)
```

Environment variables (`.env.example`): `WP_ORIGIN` (where WordPress is reachable, default the live
site), `PUBLIC_ORIGIN` (https://aststraining.com), `WP_PROXY_SECRET` (shared with the mu-plugin).

## Deployment and domain switch

See MIGRATION-NOTES.md, "Domain switch runbook". In short: deploy to a temporary Vercel URL with
`WP_ORIGIN=https://aststraining.com` and test; before switching DNS, make the same WordPress install
reachable on a second host (e.g. `cms.aststraining.com`), install `wordpress/mu-plugins/asts-proxy.php`
with `ASTS_PROXY_SECRET`, set `WP_ORIGIN` to that host and `WP_PROXY_SECRET` on Vercel, then switch
DNS. Never remove the WordPress install: it is the backend.
