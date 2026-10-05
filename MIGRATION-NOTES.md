# Migration notes (audit of https://aststraining.com/ and how it was reproduced)

Audit date: 2026-09-23. Source of truth: the live WordPress site (Educavo theme renamed
"Aststraining", Elementor, LearnPress 4.4.7, Slider Revolution 6.3.1, Contact Form 7,
Yoast SEO). Raw snapshots live in `src/data/raw/` and drive the generated data.

## URL inventory (all served at the same paths)

| Type | Count | Notes |
| --- | --- | --- |
| Pages (page-sitemap) | 31 | includes WordPress leftovers such as /sample-page/, /home/, /blog-old/, /a-homepage-section/ |
| Course categories | 11 | /courses-category/<slug>/ |
| Courses | 75 (+ /courses/) | /courses/<slug>/, 15 per page on the archive |
| Lessons / quizzes | 968 | /courses/<course>/lessons/<lesson>/ and /quizzes/<quiz>/ (content protected, as live) |
| Testimonials | 3 + category archive | /testimonials/<slug>/, /testimonial-category/student-reviews/ |
| Other | 2 | /rselements_pro/courses-categories/, search results at /?s= and /page/N/?s= |
| Sitemap-only URLs that are 404 on the live site | 992 | /lessons/<x>/ and /quizzes/<x>/ from the Yoast sitemaps; 404 here too, and no longer in the sitemap |
| WordPress attachment pages | 401 | 115 in the Yoast sitemap, 286 more found through the REST API; redirected or 410 (see "Old URLs") |
| Tag archives | 596 | /tag/<slug>/, all empty (the site has no posts), in no sitemap; redirected to the matching course/category |

## Old URLs: redirects and retired pages (2026-10-05, after the SEO migration audit)

Old URLs are answered in code, not by `vercel.json`: with `trailingSlash: true` a `vercel.json`
redirect only matches when its source is written with the slash (the first-pass rules never fired on
the deployment), and the old site has more URLs (about 1,300) than the file may hold.

- `src/lib/legacy-urls.js` decides where an old URL goes. It is called by `middleware.js` (Vercel),
  `server/vite-wp-proxy.js` (local dev/preview), `scripts/build-data.mjs` (links inside captured
  content) and `scripts/check-links.mjs`, so every environment answers identically.
- `scripts/gen-redirects.mjs` builds the exact rules (`src/data/redirects.js`: 907 redirects, 108
  "gone") from the raw snapshots and refuses to write them if a target is not a page of the new
  site or is itself redirected (no loops, no chains). Run it with `npm run build:data`.
- 301, with or without the trailing slash, any letter case, query string kept:
  - root-level course URLs and anything under them (`/python-online-training/`,
    `/python-online-training/python/` instructor links, `/arcs/`), numbered copies and the
    unambiguous start of a course slug, as WordPress guessed them -> `/courses/<slug>/`
  - `/course/<slug>/`, `/instructor/<name>/` -> the course; `/testimonials/` -> the testimonials page;
    `/courses/page/N/` -> `/courses/`; `/blog/page/N/` -> `/blog/`; `/index.php[/path]`; `/embed/`
  - leftover pages that duplicate another page (`src/data/retired-pages.mjs`): `/home/` -> `/`,
    `/blog-old/` -> `/blog/`, `/privacy-policy-2/`, `/term_conditions/`, `/training-programs/`,
    `/hadoop/` (and `/courses__trashed/hadoop/`) -> the Hadoop course, `/instructor/`,
    `/rselements_pro/courses-categories/`, `/testimonial-category/student-reviews/`
  - all 401 media attachment pages and 596 tag archives (lists from the WordPress REST API,
    `src/data/raw/media.json` and `tags.json`; almost none were in a sitemap): to the page they are
    attached to, else to the course / category / page their name matches
- 410 Gone: attachment pages of decorative images (sliders, backgrounds, logos, icons) and the empty
  `uncategorized` archive, which have no equivalent. Nothing is redirected to the homepage just to
  avoid a 404; unknown URLs get the site's 404 page with status 404.
- Kept online but `noindex, follow` and out of the sitemap (no useful equivalent): `/sample-page/`,
  `/a-homepage-section/`, `/thanks/`, `/instructors/`, `/lp-profile/`, `/become-a-teacher/`,
  `/lp-checkout/` (header set by the proxy).
- `vercel.json` (from `scripts/gen-vercel.mjs`) only holds `www` -> apex, caching headers and the
  staging "noindex" header. Vercel answers slash-less URLs of real pages with 308 (permanent).
- There is no catch-all fallback to WordPress: `api/wp.js` is not wired to a rewrite.

## Sitemaps

The site serves its own XML sitemaps, written at build time by `scripts/sitemap.mjs` with the file
names Yoast used (`sitemap_index.xml`, `page-sitemap.xml`, `lp_course-sitemap.xml`,
`course_category-sitemap.xml`, `testimonials-sitemap.xml`): 111 URLs, every indexable page of this
site, always on `https://aststraining.com`. WordPress' sitemaps are no longer proxied; they omitted
the courses that only exist here and listed 115 attachment pages and 992 lesson/quiz URLs that
answer 404. Lesson and quiz pages are not in the sitemap because their canonical is the course.

## Staging address

`asts-website.vercel.app` (and every other `*.vercel.app` address, including preview deployments)
answers with `X-Robots-Tag: noindex, nofollow` (`vercel.json`), and every page names
`https://aststraining.com/...` as its canonical, including pages WordPress renders through the
proxy (`server/wp-proxy.js`). After the domain switch the production domain is the only indexable
address; nothing has to be turned off.

## Live-site quirks that were deliberately preserved (say the word to change any of them)

1. Homepage bottom: an Elementor placeholder heading "Add Your Heading Text Here" and a grey
   placeholder image are visible on the live homepage. They are reproduced.
2. "Our Training" card "Corporate Training" and the Services page card "Classroom Training" link to
   `/classroom-training/` (404 on the live site); a redirect now sends it to `/corporate-training/`.
3. Services page "VIEW ALL COURSES" links to `/courses-2/` (404 live); now redirected to `/courses/`.
4. Course sidebar "Course Categories" widget links `/category/bigdata/`, `/courses-category/dwh-etl/`,
   `/courses-category/dwh-reporting/` are broken on the live site and remain 404 (no target exists).
5. "Latest News & Events" (home and Services) renders an empty grid: the live site has no blog posts.
6. The homepage contact bar (email / phone / social icons) exists in the markup but is hidden by the
   site's own custom CSS on the live site; same here.
7. The course archive pagination is hidden by the site's custom CSS on the live site; `?paged=N` still works.
8. The "Idea Discussion" card and page contain lorem-ipsum text on the live site; kept verbatim.
9. The `/hadoop/` page's canonical on the live site points to `/courses__trashed/hadoop/`; kept.
10. Footer "Services" links carried WordPress customizer query strings on the live site; they now
    point at the clean URLs (`/online-training/` etc.).
11. The homepage counters are static numbers on the live site (no count-up animation is initialised
    there), so they are static here too.
12. The homepage Elementor stylesheet (post-1844.css) returns 404 on the live site; the homepage is
    reproduced as it actually renders without it.
13. The /instructors/ page shows LearnPress' loading skeleton on the live site (no script fills it);
    reproduced as rendered. The course "Reviews" tab is filled by the WordPress backend, as live.

## WordPress as the backend (headless)

The live site's dynamic features all run inside WordPress/LearnPress (accounts, enrolment, checkout,
lessons for enrolled users, quizzes, profile, become-a-teacher, comments, Contact Form 7 email,
search, feeds, Yoast sitemaps, REST API). Re-implementing LearnPress would not be equivalent, so
WordPress stays as the backend and the front end forwards those requests to it on the same domain
(`middleware.js`, `server/wp-proxy.js`, rules in `src/lib/wp-routing.js`):

| Function | How it works now |
| --- | --- |
| Contact / Registration / Student / Faculty forms | POST to Contact Form 7's REST endpoint with the same fields, hidden fields and Conditional Fields data as the live forms; WordPress validates and sends the emails with the existing CF7 settings; CF7's messages are shown. Client-side checks use the form's SWV schema from WordPress, as CF7 does. |
| Login, profile, become a teacher | `/wp-login.php` is WordPress' own page. Logged-in visitors (`wordpress_logged_in_*` cookie) get every page rendered by WordPress, so profile, enrolled lessons, quizzes, become-a-teacher and "Continue" buttons behave exactly as today. |
| Course enrolment ("Start Now") | Same request as LearnPress' script (`/wp-json/lp/v1/courses/enroll-course`); guests are sent to `/lp-checkout/` (rendered by WordPress), logged-in users are enrolled. |
| Comments | The form posts to `/wp-comments-post.php`; WordPress stores and moderates. Published comments are shown using WordPress' rendering of the comments section. |
| Reviews tab | Loaded from LearnPress (`/lp-ajax-handle`, course-rating-reviews), as live. |
| Search, feeds, REST API, xmlrpc | Answered by WordPress (identical titles, noindex, pagination, XML). |
| Content management | Edit in wp-admin as today; `npm run sync && npm run build` (Deploy Hook on publish) refreshes the prerendered pages. |

### What depends on WordPress, and what must point to `cms.aststraining.com`

Target architecture: front end `https://aststraining.com/` (Vercel), backend
`https://cms.aststraining.com/` (the same WordPress install, reached only through the proxy).
The browser never talks to the backend host: every request below goes to the front-end domain and
`middleware.js` forwards it (`server/wp-proxy.js`). **The only setting that names the backend is
the Vercel environment variable `WP_ORIGIN`.** No URL in the code has to change.

| Feature | Request the browser makes (same domain) | Code |
| --- | --- | --- |
| Contact, Registration, Student and Faculty forms | `GET /wp-json/contact-form-7/v1/contact-forms/<id>/feedback/schema` (validation rules), `POST /wp-json/contact-form-7/v1/contact-forms/<id>/feedback` (forms 2140, 2177, 2178 and the contact form) | `src/components/forms/Cf7Form.jsx`, `src/lib/cf7.js` |
| Course enrolment ("Start Now") | `POST /wp-json/lp/v1/courses/enroll-course`, then `/lp-checkout/` | `src/components/course/CourseSidebar.jsx` |
| Course reviews tab | `POST /lp-ajax-handle?id_url=course-rating-reviews` | `src/components/course/LpAjaxElement.jsx` |
| Course comments | `GET /wp-json/wp/v2/comments?post=<id>`, the course page with header `x-asts-render: wordpress`, `POST /wp-comments-post.php` | `src/components/course/CommentForm.jsx` |
| Search | `GET /?s=<term>` and `/page/N/?s=<term>` (homepage search box, WordPress renders the results) | `src/components/home/NewHome.jsx` |
| Login and account | `/wp-login.php` (lesson pages link to it), `/wp-admin/`, `/lp-profile/<user>/...`, and every page for a visitor with a `wordpress_logged_in_*` cookie | `src/pages/CourseItem.jsx`, `src/lib/wp-routing.js` |
| Checkout | `/lp-checkout/` | `src/lib/wp-routing.js` |
| Feeds, REST API, XML-RPC, cron | `/feed/`, `/comments/feed/`, `/<any>/feed/`, `/wp-json/...`, `/xmlrpc.php`, `/wp-cron.php` | `src/lib/wp-routing.js` |
| WordPress query URLs | `?p=`, `?page_id=`, `?attachment_id=`, `?preview=`, `?replytocom=` ... (WordPress redirects them to the page) | `src/lib/wp-routing.js` |
| Theme / plugin files referenced by WordPress-rendered pages | `/wp-includes/...`, `/wp-content/plugins/...`, `/wp-content/themes/...` | `src/lib/wp-routing.js` |
| Content | `npm run sync` reads pages, courses, media and tags from `WP_ORIGIN` (HTTP GET only) | `scripts/sync-from-wp.mjs` |

Not dependent on WordPress: every prerendered page, the XML sitemaps, `robots.txt`, redirects of old
URLs, images under `/wp-content/uploads/` (copied into the build), and the five courses of
`src/data/local-courses.mjs`.

At the domain switch, exactly these point to the backend host:

1. Vercel environment variables: `WP_ORIGIN=https://cms.aststraining.com`,
   `PUBLIC_ORIGIN=https://aststraining.com` (unchanged), `WP_PROXY_SECRET=<random value>`.
2. DNS: `cms.aststraining.com` -> the current WordPress hosting (same document root).
3. WordPress: Site Address and WordPress Address stay `https://aststraining.com` (the proxy sends
   the public host); `wordpress/mu-plugins/asts-proxy.php` installed with the same secret. With it,
   requests that reach the backend host directly (not through the proxy) are answered with
   `X-Robots-Tag: noindex, nofollow`, so `cms.aststraining.com` cannot become a second indexed copy.
4. For `npm run sync` on a developer machine: `WP_ORIGIN=https://cms.aststraining.com` in `.env`.

Until the switch, `WP_ORIGIN` stays unset (it defaults to `https://aststraining.com`, the live
WordPress), which is how the staging deployment works today.

## Domain switch runbook (do not skip steps)

1. Deploy to a temporary Vercel URL. Build command `npm run sync && npm run build`, output `dist`.
   Environment: `WP_ORIGIN=https://aststraining.com` (the live WordPress). Test everything there.
2. Back up WordPress (files + database) on Hostinger.
3. Make the SAME WordPress install reachable on a second hostname, e.g. `cms.aststraining.com`
   (DNS A/CNAME to Hostinger + add it in hPanel pointing at the same document root). Do not change
   WordPress' Site Address / WordPress Address (they stay https://aststraining.com).
4. Copy `wordpress/mu-plugins/asts-proxy.php` to `wp-content/mu-plugins/` and add
   `define( 'ASTS_PROXY_SECRET', '<long random value>' );` to wp-config.php.
5. In Vercel set `WP_ORIGIN=https://cms.aststraining.com` and `WP_PROXY_SECRET=<same value>`; redeploy.
6. Wordfence: set "How does Wordfence get IPs" to use X-Forwarded-For (trusted proxy) so visitor IPs,
   rate limits and lockouts apply per visitor, not to Vercel.
7. Add `aststraining.com` and `www.aststraining.com` to the Vercel project, then switch DNS.
8. Final test on the real domain (forms send email, login, enrol, comments, search, old-URL
   redirects, 404s), then Google Search Console: resubmit `sitemap_index.xml` (now the static one
   of this site) and watch the Pages report for new 404s.
9. Create a Vercel Deploy Hook and call it from WordPress on publish/update (e.g. a small plugin or
   WP Webhooks) so content edits rebuild the site.

Limit: requests through the proxy are subject to Vercel's request body limit (about 4.5 MB), so a
single media upload in wp-admin must stay below that size.

## Tracking preserved

Google tag `UA-100326091-2` (gtag) + Google Ads `AW-871173008`, Google Search Console
verification meta tag, Tidio chat widget (`eqws5nvtzvdolqavuol3gv5hzxn8rarg`).
Note (checked 2026-10-05): the `UA-` id is not dead. Google has connected it to the GA4 property
`G-99C4Q06EPZ`, and loading it sends page views there (`/g/collect?tid=G-99C4Q06EPZ`). Both ids are
therefore kept exactly as on the live site. Only the loading changed: the commands queue at once
and Google's script is fetched after the page has finished loading (`index.html`). The owner can
later replace the `UA-` id by the GA4 id itself in Google Analytics / `index.html`.

## Course catalogue and internal links (2026-10-05)

- The homepage shows the owner's 9 featured courses (`src/data/trending-courses.js`); `/courses/`
  lists all 80 courses again (featured first, 15 per page, page numbers visible) and ends with the
  "All Courses" directory (`src/components/course/CourseDirectory.jsx`): the 11 categories with a
  link to every course, in the page's HTML. Each category page lists all its courses. Every
  course is two clicks from the homepage (`src/lib/featured.js`).
- Sidebars link all 11 categories; the footer links the 4 featured ones and "All Courses".
- `scripts/check-links.mjs` (`npm run check:links`) fails if any internal link leads to an old URL,
  a URL without its trailing slash, or a 404. Links inside captured WordPress content are rewritten
  at build time to the page that now answers them.

## Performance (2026-10-05)

- Homepage: instead of the old theme's 1.7 MB stylesheet bundle it loads the 37 KB of that bundle
  its own HTML uses, extracted on every build by `scripts/light-css.mjs` (rules kept whole and in
  order; screenshots are pixel-identical), and none of the theme's Google Fonts. Links leaving the
  homepage are normal page loads so the next page arrives with its styles.
- Inner pages: one Google Fonts request (same families, weights and styles) instead of six.
- All pages: Google's tag script loads after the page; see "Tracking preserved".
- Still heavy: the theme bundle on the inner pages. Trimming it needs the same extraction per
  page type plus checks of every interactive state, so it was left for a separate step.

## Verification performed

- Visible text of home, courses archive, category, course, lesson, contact, about, services,
  registration, payment, blog, testimonial pages diffed against the live HTML: identical apart from
  content added by JavaScript on the live site (slider dots, cloned slides).
- Computed geometry/typography/colour of key elements compared between live and new at 1440px and
  375px: identical (same document heights and section heights on the homepage at both widths).
- 102k internal links across the 1,091 prerendered pages resolve to a page, file or redirect,
  except the three sidebar links that are broken on the live site (item 4 above).

## Frontend redesign (owner-approved direction 2026-09-25, localhost only, not deployed)

- Full UI redesign requested by the owner (supersedes the same-design/photo-only request made earlier
  the same day). Site-wide header/footer: src/components/site/SiteHeader.jsx, SiteFooter.jsx; homepage:
  src/components/home/NewHome.jsx; styles: src/styles/redesign.css (all classes prefixed nx-).
- Fonts Plus Jakarta Sans + Inter (self-hosted, @fontsource); colours #21A7D0 / #0B1F3A.
- Homepage: split hero (badge, search form unchanged: GET / ?s=, two CTAs, category chips, floating stat
  and course cards), counters that count up on scroll, category / training / trending-course cards (course
  facts come from courses-index.json), About split with highlights from its own text, Why Choose, a
  testimonial grid that becomes a swipe carousel under 992px, CTA, and the news section (no posts are
  published, so it shows an empty-state panel). Motion respects prefers-reduced-motion.
- Photos: public/images/home/*.webp (Unsplash licence, IMAGE-CREDITS.md), all with alt text.
- Verified on all 1,091 pages vs the pre-redesign build: SEO head (title, meta, canonical, robots, OG,
  JSON-LD) identical; no internal link lost or added; sitemaps, robots.txt and vercel.json unchanged;
  backend/proxy/forms/LearnPress code byte-identical.
- Inner pages still use the theme styling inside the new header/footer; restyling them is the next step
  after the owner reviews the homepage.
