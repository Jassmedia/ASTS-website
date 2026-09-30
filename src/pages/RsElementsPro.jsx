import React from 'react';
import Seo from '../components/Seo';
import pagesSeo from '../data/pages-seo.json';

/**
 * /rselements_pro/courses-categories/ - an RS Elements template post that the
 * current site exposes as a public page (blog-details layout, empty content).
 */
export default function RsElementsPro() {
  return (
    <>
      <Seo seo={pagesSeo['/rselements_pro/courses-categories/']} />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div className="container">
          <div id="content">
            {/* Blog Detail Start */}
            <div className="rs-blog-details pt-70 pb-70">
              <div className="row padding-">
                <div className="col-lg-12 ">
                  <article id="post-2626" className="post-2626 rselements_pro type-rselements_pro status-publish hentry">
                    <div className="breadcrumbs-inner">
                      <h2 className="page-title">Courses Categories</h2>
                      <ul className="bs-meta">
                        <li>
                          <i className="fa fa-calendar-check-o" aria-hidden="true"></i>
                          <span className="p-date">February 4, 2021</span>
                        </li>
                        {'\n'}
                        <li>
                          <span className="p-user">
                            <span className="author-name">
                              <span className="author-name">
                                <i className="fa fa-user-o" aria-hidden="true"></i> srinivas
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
                    <div className="single-content-full">
                      <div className="bs-desc">
                        <div data-elementor-type="wp-post" data-elementor-id="2626" className="elementor elementor-2626">
                          <section
                            className="elementor-section elementor-top-section elementor-element elementor-element-bf8a622 elementor-section-stretched elementor-section-boxed elementor-section-height-default elementor-section-height-default"
                            data-id="bf8a622"
                            data-element_type="section"
                          >
                            <div className="elementor-container elementor-column-gap-no">
                              <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-0f8c7dc" data-id="0f8c7dc" data-element_type="column">
                                <div className="elementor-widget-wrap"></div>
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                    <div className="clear-fix"></div>
                  </article>
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
