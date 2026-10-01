import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { ArchiveSidebar, CourseCard, CoursesBar, LpBreadcrumb, LpPagination, LpStyles, filterAndSort, useCoursesLayout } from '../components/learnpress';
import { FEATURED_COURSES } from '../lib/featured';
import pagesSeo from '../data/pages-seo.json';

const PER_PAGE = 15;

/**
 * Courses archive (/courses/): the featured courses (data/trending-courses.js) in their order, 15 per page,
 * with the LearnPress search / sort / grid-list bar and the archive sidebar.
 */
export default function Courses() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const sp = new URLSearchParams(search);
  const page = Math.max(1, parseInt(sp.get('paged') || '1', 10) || 1);
  const q = sp.get('c_search') || '';
  const orderBy = sp.get('order_by') || 'post_date';
  const [layout, setLayout] = useCoursesLayout();

  const list = filterAndSort(FEATURED_COURSES, q, orderBy);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const update = (patch) => {
    const n = new URLSearchParams(search);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    n.delete('paged');
    const s = n.toString();
    navigate('/courses/' + (s ? '?' + s : ''));
  };

  return (
    <>
      <Seo seo={pagesSeo['/courses/']} />
      <LpStyles />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div className="lp-archive-courses">
          <LpBreadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'Courses', url: '/courses/' },
            ]}
          />
          <div className="lp-content-area has-sidebar">
            <div className="lp-main-content">
              <header className="learn-press-courses-header">
                <h1>Courses</h1>
              </header>
              <div className="lp-list-courses-default">
                {' '}
                <div className="lp-target" data-id="lp-target-courses">
                  <CoursesBar search={q} orderBy={orderBy} layout={layout} onSearch={(v) => update({ c_search: v })} onOrder={(v) => update({ order_by: v === 'post_date' ? '' : v })} onLayout={setLayout} />
                  <ul className={'learn-press-courses lp-list-courses-no-css ' + layout} data-layout={layout}>
                    {slice.map((c) => (
                      <CourseCard key={c.slug} course={c} />
                    ))}
                  </ul>
                  <LpPagination page={page} pages={pages} base="/courses/" />
                </div>
                <div className="loading-after">
                  <div className="lp-loading-change lp-hidden"></div>
                </div>
              </div>
            </div>
            <ArchiveSidebar />
          </div>
        </div>
      </div>
      {/* .main-container */}
    </>
  );
}
