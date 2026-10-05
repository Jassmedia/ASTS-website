/**
 * Leftover WordPress pages that are not carried over as pages of their own.
 * Used by scripts/build-data.mjs, scripts/routes-list.mjs and scripts/gen-redirects.mjs.
 */

/**
 * Pages that duplicate (or are an empty shell of) another page: they answer with a 301 to that
 * page, are not prerendered and are not in the sitemap.
 */
export const PAGE_REDIRECTS = {
  '/home/': '/', // empty page titled like the homepage
  '/blog-old/': '/blog/', // empty
  '/privacy-policy-2/': '/privacy-policy/', // older copy of the privacy policy
  '/term_conditions/': '/terms-conditions/', // empty
  '/training-programs/': '/courses/', // empty
  '/hadoop/': '/courses/hadoop-online-training/', // "content to be updated" stub of the Hadoop course
  '/courses__trashed/hadoop/': '/courses/hadoop-online-training/', // the stub's canonical on the old site
  '/instructor/': '/instructors/', // empty
  '/rselements_pro/courses-categories/': '/courses/', // page-builder template listing the course categories
  '/testimonial-category/student-reviews/': '/about-asts-training/testimonials/', // archive of the same testimonials
};

/**
 * Pages with no useful equivalent that visitors (or forms) still reach: kept online, but with
 * `noindex, follow` and left out of the sitemap.
 */
export const NOINDEX_PAGES = [
  '/sample-page/', // WordPress' default sample page
  '/a-homepage-section/', // theme starter content
  '/thanks/', // shown after a form is sent
  '/instructors/', // empty LearnPress listing
  '/lp-profile/', // login prompt
  '/become-a-teacher/', // login prompt
  '/lp-checkout/', // empty cart (rendered by WordPress; gets the noindex header from the proxy)
];
