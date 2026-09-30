import React from 'react';
import { Link } from 'react-router-dom';
import { EWidget } from '../elementor';
import { HOME_CATEGORY_CARDS } from '../../data/site';

/** Homepage "All Courses" category cards (RS Elements rs-course-category widget). */
export default function CourseCategories({ id = '32cbb82' }) {
  return (
    <EWidget id={id} type="rs-course-category" extra="all_courses">
      <div id="rs-courses-categories" className="rs-courses-categories">
        <div className="row">
          {HOME_CATEGORY_CARDS.map((c) => (
            <div key={c.slug} className="rs-cate-slider cate-slider-style4 col-lg-4 col-md-6">
              <div className="categories-items">
                <div className="cate-images">
                  <img decoding="async" src={c.image} alt="" />
                  <div className="contents">
                    <h3 className="title">
                      <Link to={'/courses-category/' + c.slug + '/'}>{c.name}</Link>
                    </h3>
                    <span className="course-qnty">{c.count} </span>
                    <div className="vies-more">
                      <Link to={'/courses-category/' + c.slug + '/'}>View More </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EWidget>
  );
}
