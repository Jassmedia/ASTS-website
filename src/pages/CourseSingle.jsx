import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import NotFound from './NotFound';
import { LpBreadcrumb, LpStyles, ReviewStars } from '../components/learnpress';
import Curriculum from '../components/course/Curriculum';
import CourseSidebar from '../components/course/CourseSidebar';
import CommentForm from '../components/course/CommentForm';
import LpModal from '../components/course/LpModal';
import LpAjaxElement from '../components/course/LpAjaxElement';
import coursesIndex from '../data/courses-index.json';
import { useCourseData } from '../lib/courseData';

const TABS = [
  ['overview', 'Overview'],
  ['curriculum', 'Curriculum'],
  ['instructor', 'Instructor'],
  ['reviews', 'Reviews'],
];
const SKELETON = [92, 95, 92, 92, 98, 94, 92, 95, 94, 92];

/** Single course page (LearnPress single-course template as rendered on the current site). */
export default function CourseSingle() {
  const { slug } = useParams();
  const course = coursesIndex.find((c) => c.slug === slug);
  if (!course) return <NotFound />;
  return <CourseSingleInner course={course} />;
}

function CourseSingleInner({ course }) {
  const full = useCourseData(course.slug);
  const [tab, setTab] = useState('overview');
  const cat = course.categories[0];

  return (
    <>
      <Seo seo={full.seo} />
      <LpStyles />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div className="lp-archive-courses">
          <LpBreadcrumb items={full.lpBreadcrumb.map((b) => ({ name: b.name, url: b.url }))} />
          <div id="learn-press-course" className="course-summary">
            <div className="course-content course-summary-content">
              <div className="course-detail-info">
                {' '}
                <div className="lp-content-area">
                  {' '}
                  <div className="course-info-left">
                    <div className="course-meta course-meta-primary">
                      <div className="course-meta__pull-left">
                        <div className="meta-item meta-item-instructor">
                          <div className="meta-item__image">
                            <div className="instructor-avatar">
                              <img alt="User Avatar" className="avatar" src={full.instructorAvatar} width="200" height="200" />
                            </div>
                          </div>
                          <div className="meta-item__value">
                            <label>Instructor</label>
                            <div>
                              <a href="">
                                <span className="instructor-display-name">{course.instructor}</span>
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="meta-item meta-item-categories">
                          <div className="meta-item__value">
                            <label>Category</label>
                            <div>
                              {course.categories.map((c) => (
                                <Link key={c.slug} to={c.url} rel="tag">
                                  {c.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="meta-item meta-item-review">
                          <div className="meta-item__value">
                            <label>Review</label>
                            <div>
                              <ReviewStars />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <h1 className="course-title">{course.title}</h1>
                    <div className="course-meta course-meta-secondary">
                      <div className="course-meta__pull-left">
                        <div className="meta-item meta-item-duration">
                          <span className="course-duration">{course.duration}</span>
                        </div>
                        <div className="meta-item meta-item-level">
                          <span>{course.level}</span>
                        </div>
                        <div className="meta-item meta-item-lesson">
                          <span className="meta-number">{course.lessons}</span>
                        </div>
                        <div className="meta-item meta-item-quiz">
                          <span className="meta-number">{course.quizzes}</span>
                        </div>
                        <div className="meta-item meta-item-student">
                          <span className="meta-number">{course.students}</span>
                        </div>
                      </div>
                    </div>
                  </div>{' '}
                </div>{' '}
              </div>
              <div className="lp-entry-content lp-content-area">
                <div className="entry-content-left">
                  <div id="learn-press-course-tabs" className="course-tabs">
                    {TABS.map(([key]) => (
                      <input key={key} type="radio" name="learn-press-course-tab-radio" id={`tab-${key}-input`} checked={tab === key} onChange={() => setTab(key)} value={key} />
                    ))}
                    <div className="wrapper-course-nav-tabs TabsDragScroll">
                      <ul className="learn-press-nav-tabs course-nav-tabs" data-tabs="4">
                        {TABS.map(([key, label]) => (
                          <li key={key} className={`course-nav course-nav-tab-${key}` + (tab === key ? ' active' : '')}>
                            <label htmlFor={`tab-${key}-input`}>{label}</label>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="course-tab-panels">
                      <div className="course-tab-panel-overview course-tab-panel" id="tab-overview">
                        <div className="course-description" id="learn-press-course-description" dangerouslySetInnerHTML={{ __html: full.description }} />
                      </div>
                      <div className="course-tab-panel-curriculum course-tab-panel" id="tab-curriculum">
                        <Curriculum course={full} />
                      </div>
                      <div className="course-tab-panel-instructor course-tab-panel" id="tab-instructor">
                        <div className="course-author">
                          <div className="lp-course-author">
                            <div className="course-author__pull-left">
                              <img alt="User Avatar" className="avatar" src={full.author.avatar} width="200" height="200" />
                            </div>
                            <div className="course-author__pull-right">
                              <h4 className="author-title">
                                <a href={full.author.link}>
                                  {' '}
                                  <span className="instructor-display-name">{full.author.title}</span>
                                </a>
                              </h4>
                              <div className="author-description">{full.author.desc}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="course-tab-panel-reviews course-tab-panel" id="tab-reviews">
                        <div className="lp-courses-rating-reviews-ajax">
                          {/* Rendered by the WordPress backend (LearnPress Course Review), as on the live site. */}
                          <LpAjaxElement
                            key={course.id}
                            targetId={'lp-target-reviews-' + course.id}
                            skeleton={SKELETON}
                            send={{
                              args: { id_url: 'course-rating-reviews', course_id: Number(course.id), paged: 1 },
                              callback: { class: 'LearnPress\\CourseReview\\TemplateHooks\\CourseRatingTemplate', method: 'render_rating_reviews' },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <CommentForm course={course} />
                  {/* end entry content left */}
                </div>
                <CourseSidebar course={course} full={full} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* .main-container */}
      <LpModal />
    </>
  );
}
