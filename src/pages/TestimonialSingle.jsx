import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import NotFound from './NotFound';
import testimonials from '../data/testimonials.json';

const POST_IDS = { james: 1998, john: 1997, 'saiko-najran': 1995 };

/** Single testimonial page (/testimonials/<slug>/), theme "blog details" layout. */
export default function TestimonialSingle() {
  const { slug } = useParams();
  const idx = testimonials.findIndex((t) => t.slug === slug);
  if (idx < 0) return <NotFound />;
  const t = testimonials[idx];
  const prev = idx > 0 ? testimonials[idx - 1] : null;
  const next = idx < testimonials.length - 1 ? testimonials[idx + 1] : null;
  const id = POST_IDS[t.slug];

  return (
    <>
      <Seo seo={t.seo} />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div className="container">
          <div id="content">
            {/* Blog Detail Start */}
            <div className="rs-blog-details pt-70 pb-70">
              <div className="row padding-">
                <div className="col-lg-12 ">
                  <article id={'post-' + id} className={`post-${id} testimonials type-testimonials status-publish has-post-thumbnail hentry testimonial-category-student-reviews`}>
                    <div className="breadcrumbs-inner">
                      <h2 className="page-title">{t.name}</h2>
                      <ul className="bs-meta">
                        <li>
                          <i className="fa fa-calendar-check-o" aria-hidden="true"></i>
                          <span className="p-date">{t.date}</span>
                        </li>
                        {'\n'}
                        <li>
                          <span className="p-user">
                            <span className="author-name">
                              <span className="author-name">
                                <i className="fa fa-user-o" aria-hidden="true"></i> {t.author}
                              </span>
                            </span>
                          </span>
                        </li>
                        {'\n'}
                        <li className="post-view comment-right">
                          <i className="fa fa-comments-o" aria-hidden="true"></i> 0
                        </li>
                      </ul>
                    </div>
                    <div className="bs-img">
                      <img width="128" height="128" src={t.image} className="attachment-post-thumbnail size-post-thumbnail wp-post-image" alt={t.name} />{' '}
                    </div>
                    <div className="single-content-full">
                      <div className="bs-desc">
                        <p>{t.text}</p>
                      </div>
                    </div>
                    <div className="clear-fix"></div>
                  </article>
                  <div className="ps-navigation">
                    <ul>
                      {prev ? (
                        <li className="prev">
                          <div className="inner-pre">
                            <Link to={'/testimonials/' + prev.slug + '/'}>
                              <span className="next_link">Previous</span>
                              <span className="link_text"> {prev.name}</span>
                            </Link>
                          </div>
                        </li>
                      ) : null}
                      {prev && next ? '\n' : null}
                      {next ? (
                        <li className="next">
                          <div className="inner-next">
                            <Link to={'/testimonials/' + next.slug + '/'}>
                              <span className="next_link">Next</span>
                              <span className="link_text">{next.name} </span>
                            </Link>
                          </div>
                        </li>
                      ) : null}
                    </ul>
                    <div className="clearfix"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Blog Detail End */}
          </div>
        </div>
        {/* .container */}
      </div>
      {/* .main-container */}
    </>
  );
}
