import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import NotFound from './NotFound';
import { LpBreadcrumb, LpStyles } from '../components/learnpress';
import Curriculum from '../components/course/Curriculum';
import LpModal from '../components/course/LpModal';
import coursesIndex from '../data/courses-index.json';
import { useCourseData } from '../lib/courseData';
import { SITE } from '../data/site';

/**
 * Course item (lesson / quiz) page, e.g. /courses/<course>/lessons/<lesson>/.
 * As on the current site the content is protected; the page shows the course
 * curriculum sidebar, the "please login and enroll" message and prev/next links.
 * The canonical URL is the course page, as Yoast sets it on the current site.
 */
export default function CourseItem({ type }) {
  const { slug, item } = useParams();
  const course = coursesIndex.find((c) => c.slug === slug);
  if (!course) return <NotFound />;
  return <CourseItemInner course={course} itemSlug={item} type={type} />;
}

function CourseItemInner({ course, itemSlug, type }) {
  const full = useCourseData(course.slug);
  const items = full.sections.flatMap((s) => s.items);
  const base = type === 'lp_quiz' ? 'quizzes' : 'lessons';
  const url = `${course.url}${base}/${itemSlug}/`;
  const idx = items.findIndex((i) => i.url === url);
  if (idx < 0) return <NotFound />;
  const prev = idx > 0 ? items[idx - 1] : null;
  const next = idx < items.length - 1 ? items[idx + 1] : null;
  const nav = prev && next ? 'all' : next ? 'next' : 'prev';
  const loginUrl = '/wp-login.php?redirect_to=' + encodeURIComponent(SITE.origin + url.replace(/\/$/, ''));

  return (
    <>
      <Seo seo={full.seo} canonical={full.seo && full.seo.canonical} />
      <LpStyles />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div className="lp-archive-courses">
          <LpBreadcrumb items={full.lpBreadcrumb.map((b) => ({ name: b.name, url: b.url }))} />
          <div id="popup-course" className="course-summary">
            <div id="popup-header">
              <input type="checkbox" id="sidebar-toggle" title="Show/Hide curriculum" defaultChecked />
              <div className="popup-header__inner">
                <h2 className="course-title">
                  <Link to={course.url}>{course.title}</Link>
                </h2>
              </div>
              <Link to={course.url} className="back-course" aria-label="Back to course">
                <i className="lp-icon-times"></i>
              </Link>
            </div>
            <div id="popup-sidebar">
              {/* As on the live site: no filtering script is attached; submitting posts to the lesson URL (WordPress re-renders it). */}
              <form method="post" className="search-course">
                <input type="text" name="s" autoComplete="off" placeholder="Search for course content" />
                <button name="submit" aria-label="Search for course content">
                  <i className="lp-icon-search"></i>
                </button>
                <button type="button" className="clear"></button>
              </form>
              <Curriculum course={full} currentUrl={url} />
            </div>
            <div id="popup-content">
              <div id="learn-press-content-item">
                <div className="content-item-scrollable">
                  <div className="content-item-wrap">
                    <div className="learn-press-message learn-press-content-protected-message error">
                      This content is protected, please{' '}
                      <a className="lp-link-login" href={loginUrl}>
                        login
                      </a>{' '}
                      and{' '}
                      <Link className="lp-link-enroll" to={course.url}>
                        enroll
                      </Link>{' '}
                      in the course to view this content!
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="popup-footer">
              <div className="course-item-nav" data-nav={nav}>
                {prev ? (
                  <div className="prev">
                    <div className="course-item-nav__name">{prev.title}</div>
                    <Link to={prev.url}> Prev </Link>
                  </div>
                ) : null}
                {next ? (
                  <div className="next">
                    <div className="course-item-nav__name">{next.title}</div>
                    <Link to={next.url}> Next </Link>
                  </div>
                ) : null}
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
