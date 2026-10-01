import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import NotFound from './NotFound';
import { ArchiveSidebar, CourseCard, CoursesBar, LpBreadcrumb, LpStyles, filterAndSort, useCoursesLayout } from '../components/learnpress';
import categories from '../data/categories.json';
import { categoryCourses } from '../lib/featured';

/** Course category archive (/courses-category/<slug>/). */
export default function CourseCategory() {
  const { slug } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const cat = categories.find((c) => c.slug === slug);
  const [layout, setLayout] = useCoursesLayout();
  if (!cat) return <NotFound />;

  const sp = new URLSearchParams(search);
  const q = sp.get('c_search') || '';
  const orderBy = sp.get('order_by') || 'post_date';
  const courses = categoryCourses(cat);
  const list = filterAndSort(courses, q, orderBy);

  const update = (patch) => {
    const n = new URLSearchParams(search);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    const s = n.toString();
    navigate(cat.url + (s ? '?' + s : ''));
  };

  return (
    <>
      <Seo seo={cat.seo} />
      <LpStyles />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div className="lp-archive-courses">
          <LpBreadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'Courses', url: '/courses/' },
              { name: cat.name },
            ]}
          />
          <div className="lp-content-area has-sidebar">
            <div className="lp-main-content">
              <header className="learn-press-courses-header">
                <h1>{cat.name}</h1>
              </header>
              <div className="lp-list-courses-default">
                {' '}
                <div className="lp-target" data-id={'lp-target-term-' + cat.termId} data-term-id={cat.termId}>
                  <CoursesBar search={q} orderBy={orderBy} layout={layout} onSearch={(v) => update({ c_search: v })} onOrder={(v) => update({ order_by: v === 'post_date' ? '' : v })} onLayout={setLayout} />
                  <ul className={'learn-press-courses lp-list-courses-no-css ' + layout} data-layout={layout}>
                    {list.map((c) => (
                      <CourseCard key={c.slug} course={c} />
                    ))}
                  </ul>
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
