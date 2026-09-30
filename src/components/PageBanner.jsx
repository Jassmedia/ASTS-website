import React from 'react';
import { SITE } from '../data/site';

/**
 * The page-title / breadcrumb banner that sits at the bottom of <header> on
 * every inner page of the current site (theme "rs-breadcrumbs" block).
 *
 * banner = {
 *   title: string | ReactNode      // <h1 class="page-title">
 *   bg: '/wp-content/...' | null   // background image; without one the theme uses .rs-breadcrumbs-inner
 *   innerClass: 'bread-' | ''
 *   wrapperClass: string           // e.g. 'porfolio-details'
 *   trailing: boolean              // trailing space variant of the wrapper class
 *   crumbs: [{ name, url?, cls?, title? }]  // RDFa breadcrumb trail; last item is the current page
 *   currentClass: string           // class of the current (last) crumb span
 *   currentUrl: string             // meta property=url of the current crumb (omitted when undefined)
 *   searchInner: boolean           // search results variant (rs-breadcrumbs-inner wrapper inside the bg block)
 * }
 */
export default function PageBanner({ banner }) {
  if (!banner) return null;
  const { title, bg, innerClass = '', wrapperClass = 'porfolio-details', trailing = false, crumbs, currentClass, currentUrl, searchInner = false } = banner;

  const inner = (
    <div className="container">
      <div className="row">
        <div className="col-md-12 text-center">
          <div className={'breadcrumbs-inner' + (bg ? (innerClass ? ' ' + innerClass : '') : '')}>
            <h1 className="page-title">{title}</h1>
            {crumbs && crumbs.length ? <Breadcrumbs crumbs={crumbs} currentClass={currentClass} currentUrl={currentUrl} /> : null}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={'rs-breadcrumbs  ' + wrapperClass + (trailing ? ' ' : '')}>
      {bg ? (
        <div className="breadcrumbs-single" style={{ backgroundImage: `url('${SITE.origin}${bg}')` }}>
          {searchInner ? <div className="rs-breadcrumbs-inner">{inner}</div> : inner}
        </div>
      ) : (
        <div className={'rs-breadcrumbs-inner' + (innerClass ? ' ' + innerClass : '')}>{inner}</div>
      )}
    </div>
  );
}

function Breadcrumbs({ crumbs, currentClass, currentUrl }) {
  const last = crumbs.length - 1;
  return (
    <div className="breadcrumbs-title">
      {' '}
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 ? ' > ' : null}
          <span property="itemListElement" typeof="ListItem">
            {i < last && c.url !== undefined ? (
              <a property="item" typeof="WebPage" title={c.title || `Go to ${c.name}.`} href={c.url === '/' ? SITE.origin : SITE.origin + c.url} className={c.cls || 'home'}>
                <span property="name">{c.name}</span>
              </a>
            ) : (
              <span property="name" className={i === last ? currentClass : undefined}>
                {c.name}
              </span>
            )}
            {i === last && currentUrl ? <meta property="url" content={SITE.origin + currentUrl} /> : null}
            <meta property="position" content={String(i + 1)} />
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

/** Breadcrumb trail helpers reproducing the current site's Yoast breadcrumb markup. */
export const crumbHome = { name: 'ASTSTraining', url: '/', cls: 'home', title: 'Go to ASTSTraining.' };
export const crumbCourses = { name: 'Courses', url: '/courses/', cls: 'archive post-lp_course-archive', title: 'Go to Courses.' };

export function pageBanner(seo, overrides = {}) {
  if (!seo) return null;
  const crumbs = [crumbHome];
  if (seo.bcLinks) {
    for (const l of seo.bcLinks.slice(1)) crumbs.push({ name: l.name, url: l.url, cls: 'post post-page', title: `Go to ${l.name}.` });
  }
  const current = seo.bcTitle ? seo.bcTitle[seo.bcTitle.length - 1] : seo.pageTitle;
  crumbs.push({ name: current });
  return {
    title: seo.pageTitle,
    bg: seo.bcBg || null,
    innerClass: seo.bcInnerClass || '',
    wrapperClass: seo.bcWrapperClass || 'porfolio-details',
    crumbs,
    currentClass: 'post post-page current-item',
    currentUrl: seo.canonical ? seo.canonical.replace(/^https?:\/\/aststraining\.com/, '') : undefined,
    ...overrides,
  };
}
