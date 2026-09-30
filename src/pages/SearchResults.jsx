import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import coursesIndex from '../data/courses-index.json';
import pagesSeo from '../data/pages-seo.json';
import pageContent from '../data/page-content.json';
import { SITE } from '../data/site';

const PER_PAGE = 10;

const stripTags = (h) => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const excerpt = (text, words = 20) => {
  const w = stripTags(text).split(' ').filter(Boolean);
  return w.length > words ? w.slice(0, words).join(' ') + '...' : w.join(' ');
};

/** Everything WordPress search covers on the current site: courses and pages. */
function buildIndex() {
  const items = coursesIndex.map((c) => ({
    id: c.id,
    type: 'lp_course',
    cls: `post-${c.id} lp_course type-lp_course status-publish has-post-thumbnail hentry course_category-${c.categories.map((x) => x.slug).join(' course_category-')} course`,
    title: c.title,
    url: c.url,
    text: c.title + ' ' + c.short,
    summary: c.short,
    date: c.published || c.modified || '',
  }));
  for (const [key, seo] of Object.entries(pagesSeo)) {
    if (key === '/' || key === '/?s=' || key === '/404' || !seo.pageTitle) continue;
    const contentKey = key === '/courses__trashed/hadoop/' ? 'hadoop' : key.replace(/^\/|\/$/g, '').replace(/\//g, '__');
    const html = pageContent[contentKey] || '';
    const m = seo.bodyClass.match(/page-id-(\d+)/);
    items.push({
      id: m ? m[1] : key,
      type: 'page',
      cls: `post-${m ? m[1] : ''} page type-page status-publish hentry`,
      title: seo.pageTitle,
      url: key === '/courses__trashed/hadoop/' ? '/hadoop/' : key,
      text: seo.pageTitle + ' ' + stripTags(html),
      summary: excerpt(html),
      date: seo.articleModified || '',
    });
  }
  return items;
}

/** WordPress search results template (search.php of the theme). */
export default function SearchResults() {
  const { search } = useLocation();
  const { n } = useParams();
  const sp = new URLSearchParams(search);
  const q = (sp.get('s') || '').trim();
  const page = Math.max(1, parseInt(n || '1', 10) || 1);

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const all = buildIndex();
  const matches = terms.length ? all.filter((it) => terms.every((t) => it.text.toLowerCase().includes(t))) : [];
  matches.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  const pages = Math.max(1, Math.ceil(matches.length / PER_PAGE));
  const slice = matches.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pageUrl = (p) => (p === 1 ? '/' : `/page/${p}/`) + '?s=' + encodeURIComponent(q);

  return (
    <>
      <Seo seo={pagesSeo['/?s=']} title={`You searched for ${q} - ASTSTraining`} canonical={null} robots="noindex, follow" />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div className="container">
          <div id="content">
            <div className="row">
              <section id="primary" className="content-area col-lg-12 col-md-12 col-sm-12">
                <main id="main" className="site-main">
                  {slice.length ? (
                    slice.map((it) => (
                      <article key={it.url} id={'post-' + it.id} className={it.cls}>
                        <header className="entry-header">
                          <h3 className="entry-title">
                            <Link to={it.url} rel="bookmark">
                              {it.title}
                            </Link>
                          </h3>{' '}
                        </header>
                        {/* .entry-header */}
                        <div className="entry-summary">
                          <p> {it.summary} </p>
                          <div className="blog-button">
                            <Link to={it.url}>Continue Reading</Link>
                          </div>
                        </div>
                        {/* .entry-summary */}
                        {/* .entry-footer */}
                      </article>
                    ))
                  ) : (
                    <section className="no-results not-found">
                      <header className="page-header">
                        <h1 className="page-title">Nothing Found</h1>
                      </header>
                      <div className="page-content">
                        <p>Sorry, but nothing matched your search terms. Please try again with some different keywords.</p>
                      </div>
                    </section>
                  )}
                  {pages > 1 ? (
                    <div className="pagination-area">
                      <nav className="navigation pagination" aria-label="Posts pagination">
                        <h2 className="screen-reader-text">Posts pagination</h2>
                        <div className="nav-links">
                          {[
                            page > 1 ? (
                              <Link key="prev" className="prev page-numbers" to={pageUrl(page - 1)}>
                                Previous
                              </Link>
                            ) : null,
                            ...Array.from({ length: pages }, (_, i) => i + 1).map((p) =>
                              p === page ? (
                                <span key={p} aria-current="page" className="page-numbers current">
                                  {p}
                                </span>
                              ) : (
                                <Link key={p} className="page-numbers" to={pageUrl(p)}>
                                  {p}
                                </Link>
                              ),
                            ),
                            page < pages ? (
                              <Link key="next" className="next page-numbers" to={pageUrl(page + 1)}>
                                Next
                              </Link>
                            ) : null,
                          ]
                            .filter(Boolean)
                            .flatMap((el, i) => (i ? ['\n', el] : [el]))}
                        </div>
                      </nav>
                    </div>
                  ) : null}
                </main>
                {/* #main */}
              </section>
              {/* #primary */}
              <div className="clearfix"></div>
            </div>
          </div>
        </div>
      </div>
      {/* .main-container */}
    </>
  );
}

export { SITE };
