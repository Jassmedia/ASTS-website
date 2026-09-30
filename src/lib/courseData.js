// Lazily loads one course's full data (description, curriculum, instructor)
// from its own JSON chunk, suspending the component until it is available.
const modules = import.meta.glob('../data/courses/*.json');
const cache = new Map();

export function useCourseData(slug) {
  const key = `../data/courses/${slug}.json`;
  const loader = modules[key];
  if (!loader) return null;
  let entry = cache.get(key);
  if (!entry) {
    entry = {};
    entry.promise = loader().then((m) => {
      entry.data = m.default || m;
    });
    cache.set(key, entry);
  }
  if (entry.data) return entry.data;
  throw entry.promise;
}

/** All course item URLs (lessons/quizzes) for build tooling. */
export const courseModules = modules;
