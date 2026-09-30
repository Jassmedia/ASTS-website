import React from 'react';
import { Link } from 'react-router-dom';
import { EWidget } from '../elementor';
import { ReviewStars } from '../learnpress';
import { TRENDING_COURSES } from '../../data/trending-courses';

/**
 * "Trending Courses" grid (RS Elements rs-course-grid widget, course style 1).
 * The homepage variant prints 4 per row with price + title only; the Services
 * page variant prints 3 per row with category, students count, rating and
 * the arrow button (exactly as the current site renders each page).
 * Every card shows only what its entry in data/trending-courses.js defines.
 */
export default function TrendingCourses({ id, count = 8, variant = 'home' }) {
  const services = variant === 'services';
  return (
    <EWidget id={id} type="rs-course-grid" extra="trending_courses rs-testimonial--left">
      <div className="rs-courses rs_course_style1">
        <div className="row grids">
          {TRENDING_COURSES.slice(0, count).map((c) => {
            const cat = c.category;
            const students = c.students ?? 0;
            return (
              <div key={c.id} className={(services ? 'cource-block col-lg-4 col-md-6 col-sm-12' : 'cource-block col-lg-3 col-md-6 col-sm-12') + ' filter_programming '}>
                <div className="courses-item">
                  <div className="img-part">
                    <Link to={c.url}>
                      <img loading="lazy" decoding="async" width={c.image.width} height={c.image.height} src={c.image.src} className="attachment-large size-large wp-post-image" alt="" />
                    </Link>
                  </div>
                  <div className="content-part">
                    <ul className="meta-part">
                      {/* Kept even without a price: the theme CSS hides li:first-child, so the category must stay second. */}
                      <li>
                        <div className="course-price">{c.price ? <span className="price">{c.price}</span> : null}</div>
                      </li>
                      {services && cat ? (
                        <li className="cat">
                          {' '}
                          <Link to={cat.url} rel="tag">
                            {cat.name}
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                    <h3 className="title">
                      <Link to={c.url}>{c.title}</Link>
                    </h3>
                    {services ? (
                      <div className="bottom-part">
                        <div className="info-meta">
                          <ul>
                            <li className="user">
                              <i className="far fa-user"></i>
                              {students}
                            </li>
                            <li className="course-ratings">
                              <ReviewStars />
                              <div className="course-rating-total"> (0)</div>
                            </li>
                          </ul>
                        </div>
                        <div className="btn-part">
                          <Link to={c.url}>
                            <i className="flaticon-right-arrow"></i>
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </EWidget>
  );
}
