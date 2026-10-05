import coursesIndex from '../data/courses-index.json';
import categories from '../data/categories.json';
import { FEATURED_COURSE_SLUGS } from '../data/trending-courses';

const bySlug = new Map(coursesIndex.map((c) => [c.slug, c]));
const featuredRank = new Map(FEATURED_COURSE_SLUGS.map((slug, i) => [slug, i]));
// Featured courses first (in their order), the others in the order given.
const featuredFirst = (list) => [...list.filter((c) => featuredRank.has(c.slug)).sort((a, b) => featuredRank.get(a.slug) - featuredRank.get(b.slug)), ...list.filter((c) => !featuredRank.has(c.slug))];

/** The featured courses (data/trending-courses.js) as course-index entries, in featured order. */
export const FEATURED_COURSES = FEATURED_COURSE_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean);

/** The whole catalogue for /courses/: the featured courses first, then every other course in archive order. */
export const ALL_COURSES = featuredFirst(coursesIndex);

/** Every course of a category, featured ones first. */
export function categoryCourses(cat) {
  return featuredFirst(cat.courses.map((slug) => bySlug.get(slug)).filter(Boolean));
}

/**
 * The 11 course categories with their courses, for the "All Courses" directory: the categories
 * that hold featured courses first, in the order those courses are featured.
 */
export const CATEGORY_DIRECTORY = (() => {
  const firstFeatured = (cat) => Math.min(...cat.courses.map((slug) => (featuredRank.has(slug) ? featuredRank.get(slug) : Infinity)));
  return categories
    .map((cat) => ({ slug: cat.slug, name: cat.name, url: cat.url, courses: categoryCourses(cat) }))
    .sort((a, b) => firstFeatured(categories.find((c) => c.slug === a.slug)) - firstFeatured(categories.find((c) => c.slug === b.slug)) || a.name.localeCompare(b.name));
})();
