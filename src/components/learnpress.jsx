import React from 'react';
import { Link } from 'react-router-dom';
import { SocialListArchive } from './ContactBar';
import { LATEST_COURSES_MENU, COURSE_CATEGORIES_MENU } from '../data/site';

/**
 * LearnPress pages use the LearnPress-ordered stylesheet bundle, selected by the
 * route handle (`lp: true`) in MainLayout; nothing extra is needed here.
 */
export function LpStyles() {
  return null;
}

/** LearnPress breadcrumb: `ul.learn-press-breadcrumb` (items with url are links, last may be plain). */
export function LpBreadcrumb({ items }) {
  return (
    <ul className="learn-press-breadcrumb">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <li className="breadcrumb-delimiter">
              <i className="lp-icon-angle-right"></i>
            </li>
          ) : null}
          <li>
            {it.url ? (
              <Link to={it.url}>
                <span>{it.name}</span>
              </Link>
            ) : (
              <span>{it.name}</span>
            )}
          </li>
        </React.Fragment>
      ))}
    </ul>
  );
}

const Star = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/** The five (empty) review stars printed by the LearnPress course review add-on. */
export function ReviewStars() {
  return (
    <div className="review-stars-rated">
      {[0, 1, 2, 3, 4].map((i) => (
        <div className="review-star" key={i}>
          <em className="far lp-review-svg-star">
            <Star />
          </em>
          <em className="fas lp-review-svg-star" style={{ width: '0%' }}>
            <Star />
          </em>
        </div>
      ))}
    </div>
  );
}

/** One course card of the courses archive / category listing. */
export function CourseCard({ course }) {
  const cat = course.categories[0];
  return (
    <li className="course">
      <div className="course-item" data-id={course.id}>
        <div className="course-thumbnail">
          <Link to={course.url}>
            <div className="course-img">
              <img src={course.thumb} alt={course.title} />
            </div>
          </Link>
        </div>
        <div className="course-content">
          <ReviewStars />
          <h3 className="wap-course-title">
            <Link className="course-permalink" to={course.url} aria-label={course.title}>
              <span className="course-title">{course.title}</span>
            </Link>
          </h3>
          <div className="course-instructor-category">
            <div>
              <label>by</label>{' '}
              <div className="course-instructor">
                <a href={course.url}>
                  {' '}
                  <span className="instructor-display-name">{course.instructor}</span>
                </a>
              </div>
            </div>
            {cat ? (
              <div>
                <label>in</label>{' '}
                <div className="course-categories">
                  <Link to={cat.url}>{cat.name}</Link>
                </div>
              </div>
            ) : null}
          </div>
          <div className="course-wrap-meta">
            <div className="meta-item meta-item-duration">
              <span className="course-duration">{course.duration}</span>
            </div>
            <div className="meta-item meta-item-level">
              <span className="course-level">{course.level}</span>
            </div>
            <div className="meta-item meta-item-lesson">
              <div className="course-count-item lp_lesson">{course.lessonsLabel}</div>
            </div>
            <div className="meta-item meta-item-quiz">
              <div className="course-count-item lp_quiz">{course.quizzesLabel}</div>
            </div>
            <div className="meta-item meta-item-student">
              <div className="course-count-student">{course.studentsLabel}</div>
            </div>
          </div>
          {course.short ? <p className="course-short-description">{course.short}</p> : null}
          <div className="course-info">
            {course.price ? (
              <span className="course-price">
                <span className="course-item-price">
                  <span className="free">{course.price}</span>
                </span>
              </span>
            ) : null}
            <div className="course-readmore">
              <Link to={course.url}>{course.readmore || 'Enroll Now'}</Link>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export const ORDER_OPTIONS = [
  ['post_date', 'Newly published'],
  ['post_title', 'Title a-z'],
  ['post_title_desc', 'Title z-a'],
  ['price', 'Price high to low'],
  ['price_low', 'Price low to high'],
  ['popular', 'Popular'],
  ['rating', 'Average Ratings'],
];

/** Search / sort / layout bar above the course listing. */
export function CoursesBar({ search, orderBy, layout, onSearch, onOrder, onLayout }) {
  return (
    <div className="lp-courses-bar">
      <form
        className="search-courses"
        method="get"
        action="/courses/"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(new FormData(e.currentTarget).get('c_search') || '');
        }}
      >
        <input type="search" placeholder="Search courses..." aria-label="Search courses" name="c_search" defaultValue={search} key={search} />
        <button type="submit" name="lp-btn-search-courses" aria-label="Search courses">
          <i className="lp-icon-search"></i>
        </button>
      </form>
      <div className="courses-order-by-wrapper">
        <select name="order_by" className="courses-order-by" aria-label="Sort courses" value={orderBy} onChange={(e) => onOrder(e.target.value)}>
          {ORDER_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="switch-layout">
        <input type="radio" name="lp-switch-layout-btn" value="grid" id="lp-switch-layout-btn-grid" checked={layout === 'grid'} onChange={() => onLayout('grid')} />
        <label className="switch-btn grid" title="Switch to Grid" htmlFor="lp-switch-layout-btn-grid"></label>
        <input type="radio" name="lp-switch-layout-btn" value="list" id="lp-switch-layout-btn-list" checked={layout === 'list'} onChange={() => onLayout('list')} />
        <label className="switch-btn list" title="Switch to List" htmlFor="lp-switch-layout-btn-list"></label>
      </div>
      <div className="course-filter-btn-mobile">
        <span className="lp-icon lp-icon-filter"></span>
        <span className="course-filter-count-fields-selected"></span>
      </div>
    </div>
  );
}

/** Applies the archive search + order to a list of courses (client-side equivalent of the LearnPress AJAX listing). */
export function filterAndSort(list, search, orderBy) {
  let out = list;
  const q = (search || '').trim().toLowerCase();
  if (q) out = out.filter((c) => c.title.toLowerCase().includes(q));
  out = [...out];
  const num = (s) => parseInt(String(s || '').replace(/\D/g, ''), 10) || 0;
  switch (orderBy) {
    case 'post_title':
      out.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'post_title_desc':
      out.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'popular':
      out.sort((a, b) => num(b.students) - num(a.students));
      break;
    default:
      break; // post_date (archive order), price, price_low, rating: no course has a price or a rating
  }
  return out;
}

/** Numbered pagination of the courses archive (?paged=N). */
export function LpPagination({ page, pages, base }) {
  if (pages <= 1) return null;
  const href = (p) => (p === 1 ? base : `${base}?paged=${p}`);
  const items = [];
  if (page > 1) {
    items.push(
      <li key="prev">
        <Link className="prev page-numbers" to={href(page - 1)}>
          <i className="lp-icon-arrow-left"></i>
        </Link>
      </li>,
    );
  }
  for (let p = 1; p <= pages; p++) {
    items.push(
      <li key={p}>
        {p === page ? (
          <span aria-current="page" className="page-numbers current">
            {p}
          </span>
        ) : (
          <Link className="page-numbers" to={href(p)}>
            {p}
          </Link>
        )}
      </li>,
    );
  }
  if (page < pages) {
    items.push(
      <li key="next">
        <Link className="next page-numbers" to={href(page + 1)}>
          <i className="lp-icon-arrow-right"></i>
        </Link>
      </li>,
    );
  }
  return (
    <nav className="learn-press-pagination navigation pagination">
      <ul className="page-numbers">{items.flatMap((el, i) => (i ? ['\n', el] : [el]))}</ul>
    </nav>
  );
}

/** Sidebar of the courses archive and category pages. */
export function ArchiveSidebar() {
  return (
    <div className="lp-archive-courses-sidebar">
      <div id="medvillsocialiconwi_widget-3" className="widget widget_medvillsocialiconwi_widget">
        <SocialListArchive />
      </div>
      <div id="nav_menu-5" className="widget widget_nav_menu">
        <h3 className="widget-title">LATEST COURSES</h3>
        <div className="menu-footer-latest-courses-container">
          <ul id="menu-footer-latest-courses" className="menu">
            {LATEST_COURSES_MENU.map((m) => (
              <li key={m.id} id={'menu-item-' + m.id} className={'menu-item menu-item-type-post_type menu-item-object-lp_course menu-item-' + m.id}>
                <Link to={m.url}>{m.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div id="nav_menu-6" className="widget widget_nav_menu">
        <h3 className="widget-title">COURSE CATEGORIES</h3>
        <div className="menu-footer-course-categories-container">
          <ul id="menu-footer-course-categories" className="menu">
            {COURSE_CATEGORIES_MENU.map((m) => (
              <li key={m.id} id={'menu-item-' + m.id} className={'menu-item menu-item-type-taxonomy menu-item-object-course_category menu-item-' + m.id}>
                <Link to={m.url}>{m.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Reads/writes the grid|list layout choice like LearnPress (localStorage). */
export function useCoursesLayout() {
  const [layout, setLayout] = React.useState('grid');
  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem('lp-courses-layout');
      if (v === 'list' || v === 'grid') setLayout(v);
    } catch {
      /* ignore */
    }
  }, []);
  const change = (v) => {
    setLayout(v);
    try {
      window.localStorage.setItem('lp-courses-layout', v);
    } catch {
      /* ignore */
    }
  };
  return [layout, change];
}
