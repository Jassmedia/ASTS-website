import React, { lazy } from 'react';
import MainLayout from './layouts/MainLayout';
import pagesSeo from './data/pages-seo.json';
import coursesIndex from './data/courses-index.json';
import categories from './data/categories.json';
import testimonials from './data/testimonials.json';
import { crumbCourses, crumbHome, pageBanner } from './components/PageBanner';

const Home = lazy(() => import('./pages/Home'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const LpCheckout = lazy(() => import('./pages/LpCheckout'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Payment = lazy(() => import('./pages/Payment'));
const Contact = lazy(() => import('./pages/Contact'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseCategory = lazy(() => import('./pages/CourseCategory'));
const CourseSingle = lazy(() => import('./pages/CourseSingle'));
const CourseItem = lazy(() => import('./pages/CourseItem'));
const TestimonialSingle = lazy(() => import('./pages/TestimonialSingle'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const HOME_BG = '/wp-content/uploads/2020/12/Home-dot-bg.jpg';

const seoFor = (path) => pagesSeo[path];

// `lp: true` marks pages that load the LearnPress stylesheets on the current site
// (a differently ordered CSS bundle, see MainLayout).
const staticRoute = (path, props = {}, lp = false) => ({
  path,
  element: <StaticPage path={path} {...props} />,
  handle: { bodyClass: seoFor(path).bodyClass, banner: pageBanner(seoFor(path)), lp },
});
const elementorRoute = (path, element) => ({
  path,
  element,
  handle: { bodyClass: seoFor(path).bodyClass, banner: pageBanner(seoFor(path)) },
});

const findCourse = (slug) => coursesIndex.find((c) => c.slug === slug);
const courseBanner = (params) => {
  const c = findCourse(params.slug);
  if (!c) return null;
  const cat = c.categories[0];
  return {
    title: c.title,
    bg: HOME_BG,
    wrapperClass: 'porfolio-details',
    crumbs: [crumbHome, crumbCourses, ...(cat ? [{ name: cat.name, url: cat.url, cls: 'taxonomy course_category', title: `Go to the ${cat.name} Category archives.` }] : []), { name: c.title }],
    currentClass: 'post post-lp_course current-item',
    currentUrl: c.url,
  };
};
// Courses that exist only on this site (data/local-courses.mjs) have no WordPress post id.
const postId = (c) => (c.local ? '' : ` postid-${c.id}`);
const courseBody = (params) => {
  const c = findCourse(params.slug);
  return c ? `wp-singular lp_course-template-default single single-lp_course${postId(c)} wp-custom-logo wp-theme-Aststraining Aststraining learnpress learnpress-page elementor-default elementor-kit-1820` : '';
};
const courseItemBody = (type) => (params) => {
  const c = findCourse(params.slug);
  return c
    ? `wp-singular lp_course-template-default single single-lp_course postid-${c.id} wp-custom-logo wp-theme-Aststraining course-item-popup viewing-course-item course-item-${type} lp-sidebar-toggle__open Aststraining learnpress learnpress-page elementor-default elementor-kit-1820`
    : '';
};

const searchHandle = {
  bodyClass: (params, location) => (new URLSearchParams(location.search).has('s') ? pagesSeo['/?s='].bodyClass : pagesSeo['/'].bodyClass),
  banner: (params, location) => {
    const sp = new URLSearchParams(location.search);
    if (!sp.has('s')) return null;
    return {
      title: (
        <>
          Search Results for: <span>{sp.get('s')}</span>
        </>
      ),
      bg: HOME_BG,
      wrapperClass: 'porfolio-details',
      searchInner: true,
      crumbs: null,
    };
  },
};

export const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // The redesigned homepage needs none of the old theme's stylesheets (see MainLayout).
      { index: true, element: <Home />, handle: { ...searchHandle, lightCss: (params, location) => !new URLSearchParams(location.search).has('s') } },
      { path: 'page/:n', element: <SearchResults />, handle: searchHandle },

      // --- static (CMS) pages ---
      // Leftover pages that duplicate another page are not routes: they redirect (data/retired-pages.mjs).
      staticRoute('/about-asts-training/'),
      staticRoute('/about-asts-training/testimonials/'),
      staticRoute('/a-homepage-section/'),
      staticRoute('/become-a-teacher/', {}, true),
      staticRoute('/blog/', { col: 'col-lg-8' }),
      staticRoute('/instructors/', {}, true),
      staticRoute('/lp-profile/', {}, true),
      staticRoute('/privacy-policy/'),
      staticRoute('/sample-page/'),
      staticRoute('/terms-conditions/'),
      staticRoute('/thanks/'),
      { path: '/lp-checkout/', element: <LpCheckout />, handle: { bodyClass: pagesSeo['/lp-checkout/'].bodyClass, banner: pageBanner(pagesSeo['/lp-checkout/']), lp: true } },

      // --- Elementor pages ---
      elementorRoute('/services/', <Services />),
      elementorRoute('/online-training/', <ServiceDetail slug="online-training" />),
      elementorRoute('/corporate-training/', <ServiceDetail slug="corporate-training" />),
      elementorRoute('/project-support/', <ServiceDetail slug="project-support" />),
      elementorRoute('/idea-discussion/', <ServiceDetail slug="idea-discussion" />),
      elementorRoute('/payment/', <Payment />),
      elementorRoute('/contact/', <Contact />),
      elementorRoute('/registration/', <RegistrationPage variant="registration" />),
      elementorRoute('/student-registration/', <RegistrationPage variant="student-registration" />),
      elementorRoute('/faculty-registration/', <RegistrationPage variant="faculty-registration" />),

      // --- LearnPress ---
      {
        path: '/courses/',
        element: <Courses />,
        handle: {
          lp: true,
          bodyClass: pagesSeo['/courses/'].bodyClass,
          banner: { title: 'Courses', bg: HOME_BG, wrapperClass: 'porfolio-details', trailing: true, crumbs: [crumbHome, { name: 'Courses' }], currentClass: 'archive post-lp_course-archive current-item', currentUrl: '/courses/' },
        },
      },
      { path: '/courses/:slug/', element: <CourseSingle />, handle: { lp: true, bodyClass: courseBody, banner: courseBanner } },
      { path: '/courses/:slug/lessons/:item/', element: <CourseItem type="lp_lesson" />, handle: { lp: true, bodyClass: courseItemBody('lp_lesson'), banner: courseBanner } },
      { path: '/courses/:slug/quizzes/:item/', element: <CourseItem type="lp_quiz" />, handle: { lp: true, bodyClass: courseItemBody('lp_quiz'), banner: courseBanner } },
      {
        path: '/courses-category/:slug/',
        element: <CourseCategory />,
        handle: {
          lp: true,
          bodyClass: (params) => (categories.find((c) => c.slug === params.slug) || { seo: {} }).seo.bodyClass || '',
          banner: (params) => {
            const cat = categories.find((c) => c.slug === params.slug);
            return cat
              ? {
                  title: (
                    <>
                      Category: <span>{cat.name}</span>
                    </>
                  ),
                  bg: HOME_BG,
                  wrapperClass: 'porfolio-details',
                  trailing: true,
                  crumbs: [crumbHome, crumbCourses, { name: cat.name }],
                }
              : null;
          },
        },
      },

      // --- testimonials ---
      { path: '/testimonials/:slug/', element: <TestimonialSingle />, handle: { bodyClass: (params) => (testimonials.find((t) => t.slug === params.slug) || { seo: {} }).seo.bodyClass || '', banner: null } },

      // --- 404 (the current site's 404 template has no header/footer) ---
      { path: '*', element: <NotFound />, handle: { bodyClass: 'error404 wp-custom-logo wp-theme-Aststraining elementor-default elementor-kit-1820', banner: null, bare: true } },
    ],
  },
];
