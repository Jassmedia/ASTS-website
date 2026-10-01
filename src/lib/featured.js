import coursesIndex from '../data/courses-index.json';
import { FEATURED_COURSE_SLUGS } from '../data/trending-courses';

/** The featured courses (data/trending-courses.js) as course-index entries, in featured order. */
export const FEATURED_COURSES = FEATURED_COURSE_SLUGS.map((slug) => coursesIndex.find((c) => c.slug === slug)).filter(Boolean);

/**
 * Courses a category page lists: its featured courses when it has any; otherwise (a category that
 * is no longer linked from the site) every course WordPress files under it.
 */
export function categoryCourses(cat) {
  const featured = FEATURED_COURSES.filter((c) => c.categories.some((x) => x.slug === cat.slug));
  return featured.length ? featured : cat.courses.map((s) => coursesIndex.find((c) => c.slug === s)).filter(Boolean);
}
