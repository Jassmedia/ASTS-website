import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { matchRoutes, Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { needsServerNavigation } from '../lib/wp-routing';
// Circular (routes.jsx imports this layout); only read inside the click handler at runtime.
import { routes } from '../routes';
import { Helmet } from 'react-helmet-async';
import SiteHeader from '../components/site/SiteHeader';
import SiteFooter from '../components/site/SiteFooter';
import PageBanner from '../components/PageBanner';
import redesignCss from '../styles/redesign.css?url';
import FloatingSocial from '../components/FloatingSocial';
import ScrollUp from '../components/ScrollUp';
import { useElementorAnimations, useElementorStretch, useTilt } from '../hooks/useSiteBehaviours';
import pageInlineCss from '../data/page-inline-css.json';
import defaultCss from '../styles/index.css?url';
import lpCss from '../styles/index-lp.css?url';

/**
 * Page chrome shared by every route: off-canvas menu, header (+ page banner),
 * the routed page, footer, back-to-top button and the floating social bar.
 * Per-route banner, <body> classes and the stylesheet bundle (regular vs
 * LearnPress order) come from the route `handle`.
 */
export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const matches = useMatches();
  const match = [...matches].reverse().find((m) => m.handle) || null;
  const handle = (match && match.handle) || {};
  const banner = typeof handle.banner === 'function' ? handle.banner(match.params, location) : handle.banner || null;
  const pageBodyClass = typeof handle.bodyClass === 'function' ? handle.bodyClass(match.params, location) : handle.bodyClass || '';
  const bare = !!handle.bare; // 404 template of the current site has no header/footer
  const css = handle.lp ? lpCss : defaultCss;
  const otherCss = handle.lp ? defaultCss : lpCss;
  const pathKey = location.pathname.replace(/\/?$/, '/');
  const inlineCss = pageInlineCss[pathKey];

  // Scroll-reveal animations of the redesign only run when JavaScript is active.
  useEffect(() => {
    document.documentElement.classList.add('nx-js');
  }, []);

  // New page: start at the top (as a full page load would)
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.key]);

  // Behaviours the original site implemented with jQuery plugins
  useElementorStretch(location.key);
  useElementorAnimations(location.key);
  useTilt(location.key);

  // Client-side navigation for internal links inside captured CMS HTML
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return;
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      const sameSite = url.origin === window.location.origin || /(^|\.)aststraining\.com$/.test(url.hostname);
      if (!sameSite) return;
      if (/\.(pdf|jpe?g|png|gif|webp|svg|xml|txt|zip)$/i.test(url.pathname) || /^\/wp-/.test(url.pathname)) return;
      // URLs answered by the WordPress backend (login, checkout, search, feeds, ...) load from the server.
      if (needsServerNavigation(url)) return;
      // Same-site paths the front end does not prerender (attachment pages, legacy URLs) are answered by WordPress too.
      const matched = matchRoutes(routes, url.pathname);
      if (!matched || matched[matched.length - 1].route.path === '*') return;
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  return (
    <>
      <Helmet>
        <link rel="stylesheet" href={css} />
        {/* Redesign (header, footer, homepage): after the theme bundle so it takes precedence. */}
        <link rel="stylesheet" href={redesignCss} />
        <link rel="prefetch" href={otherCss} as="style" />
        {inlineCss ? <style type="text/css">{inlineCss}</style> : null}
        <body className={pageBodyClass} />
      </Helmet>
      {bare ? (
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      ) : (
        <div id="page" className="site ">
          <SiteHeader />
          {banner ? (
            <div className="nx-page-banner">
              <PageBanner banner={banner} />
            </div>
          ) : null}
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
          <SiteFooter />
        </div>
      )}
      {/* #page */}
      {/* start scrollUp */}
      <ScrollUp />
      <FloatingSocial />
    </>
  );
}
