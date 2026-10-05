import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../site/Icons';
import { CATEGORY_DIRECTORY } from '../../lib/featured';

/**
 * "All Courses" directory on /courses/: every course category with a link to each of its
 * courses. The course grid above it is paged, so this is what keeps every course page one
 * click away from the catalogue (for visitors and for search engines).
 */
export default function CourseDirectory() {
  const total = CATEGORY_DIRECTORY.reduce((n, cat) => n + cat.courses.length, 0);
  return (
    <section className="nx-course-directory" aria-labelledby="course-directory-title">
      <div className="nx-course-directory-head">
        <h2 id="course-directory-title">All Courses</h2>
        <p>
          {total} courses in {CATEGORY_DIRECTORY.length} categories
        </p>
      </div>
      <div className="nx-course-directory-grid">
        {CATEGORY_DIRECTORY.map((cat) => (
          <div key={cat.slug} className="nx-course-directory-group">
            <h3>
              <Link to={cat.url}>
                {cat.name} <Icon name="arrowRight" />
              </Link>
              <span>{cat.courses.length}</span>
            </h3>
            <ul>
              {cat.courses.map((c) => (
                <li key={c.slug}>
                  <Link to={c.url}>{c.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
