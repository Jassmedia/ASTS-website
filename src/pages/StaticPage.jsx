import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Seo from '../components/Seo';
import { MainContain } from '../components/elementor';
import pagesSeo from '../data/pages-seo.json';
import pageContent from '../data/page-content.json';
import suCss from '../styles/shortcodes-ultimate.css?url';
import lpInstructorsCss from '../styles/learnpress-instructors.css?url';

const seoKeyFor = (path) => (path === '/hadoop/' ? '/courses__trashed/hadoop/' : path);
const contentKeyFor = (path) => (path === '/hadoop/' ? 'hadoop' : path.replace(/^\/|\/$/g, '').replace(/\//g, '__'));

/** Pages whose extra stylesheets the current site only loads on that page
 *  (the LearnPress base CSS itself comes from the LearnPress bundle, see routes). */
const EXTRA_CSS = {
  '/hadoop/': [suCss],
  '/instructors/': [lpInstructorsCss],
  '/instructor/': [lpInstructorsCss],
};

/**
 * Regular WordPress page: the CMS HTML captured from the current site inside the
 * theme's page wrapper (article#post-N > .entry-content).
 */
export default function StaticPage({ path, col = 'col-lg-12' }) {
  const seo = pagesSeo[seoKeyFor(path)];
  const html = pageContent[contentKeyFor(path)] || '';
  const postId = (seo.bodyClass.match(/page-id-(\d+)/) || [])[1];

  // Shortcodes Ultimate spoilers (the /hadoop/ page) toggle open/closed on click.
  useEffect(() => {
    if (path !== '/hadoop/') return undefined;
    const onClick = (e) => {
      const title = e.target.closest('.su-spoiler-title');
      if (!title) return;
      title.parentElement.classList.toggle('su-spoiler-closed');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [path]);

  return (
    <>
      <Seo seo={seo} />
      {EXTRA_CSS[path] ? (
        <Helmet>
          {EXTRA_CSS[path].map((href) => (
            <link key={href} rel="stylesheet" href={href} />
          ))}
        </Helmet>
      ) : null}
      {/* End Header Menu End */}
      <MainContain col={col} article={{ id: postId }} html={html} />
      {/* .main-container */}
    </>
  );
}
