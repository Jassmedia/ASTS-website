/**
 * WordPress courses whose card/page image is replaced by a drawn name image in the same style
 * as the local courses (light panel, course name in large letters, product name underneath).
 *
 *   slug -> { title, subtitle }   text of the image
 *
 * `npm run gen:course-images` draws public/images/courses/<slug>.webp from each entry, and
 * `npm run build:data` points the course's card and page image at it. The course's original
 * image file stays in /wp-content/uploads/ and its social-sharing (og:image) tag is unchanged.
 * Also update the course's `image` in trending-courses.js if it is in the featured list.
 */
export const COURSE_IMAGE_OVERRIDES = {
  'arcs-online-training': { title: 'ARCS', subtitle: 'Account Reconciliation Cloud Service' },
};

export const courseImagePath = (slug) => `/images/courses/${slug}.webp`;
