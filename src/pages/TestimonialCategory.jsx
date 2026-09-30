import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import testimonials from '../data/testimonials.json';
import pagesSeo from '../data/pages-seo.json';

const POST_IDS = { james: 1998, john: 1997, 'saiko-najran': 1995 };

/** Testimonial category archive (/testimonial-category/student-reviews/), theme blog grid layout. */
export default function TestimonialCategory() {
  return (
    <>
      <Seo seo={pagesSeo['/testimonial-category/student-reviews/']} />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div id="rs-blog" className="rs-blog blog-page">
          <div className="container">
            <div id="content">
              <div className="row padding-full-layout">
                <div className="contents-sticky col-md-12 col-lg-8-full full-layout">
                  <div className="row">
                    {testimonials.map((t) => (
                      <div key={t.slug} className="col-sm-6 col-xs-12">
                        <article className={`post-${POST_IDS[t.slug]} testimonials type-testimonials status-publish has-post-thumbnail hentry testimonial-category-student-reviews`}>
                          <div className="blog-item ">
                            <div className="blog-img">
                              <Link to={'/testimonials/' + t.slug + '/'}>
                                <img width="128" height="128" src={t.image} className="attachment-post-thumbnail size-post-thumbnail wp-post-image" alt="" />{' '}
                              </Link>
                            </div>
                            {/* .blog-img */}
                            <div className="full-blog-content">
                              <div className="title-wrap">
                                <h3 className="blog-title">
                                  <Link to={'/testimonials/' + t.slug + '/'}>{t.name}</Link>
                                </h3>
                                <div className="blog-meta">
                                  <ul className="btm-cate">
                                    <li>
                                      <div className="blog-date">
                                        <i className="fa fa-calendar-check-o"></i> {t.date}
                                      </div>
                                    </li>
                                    {'\n'}
                                    <li>
                                      <div className="author">
                                        <i className="fa fa-user-o"></i> {t.author}
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                              <div className="blog-desc">{t.excerpt}</div>
                              <div className="blog-button ">
                                <Link to={'/testimonials/' + t.slug + '/'}>Continue Reading</Link>
                              </div>
                            </div>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pagination-area"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* .main-container */}
    </>
  );
}
