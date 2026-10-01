/**
 * Courses in the homepage "Trending Courses" grid. The same list drives the Services page
 * course grid, and the first entry is the featured course card in the homepage hero.
 * Cards render only what is defined here: edit this list to change names, images or order.
 *
 *   id        unique key (e.g. the course slug)
 *   title     course name shown on the card
 *   url       page the card and its "View Course" link open
 *   image     { src, width, height, alt }: the course's own image from the current site
 *             (/wp-content/uploads/...), or for a course of data/local-courses.mjs, its image
 *             public/images/courses/<id>.webp drawn by `npm run gen:course-images`.
 *   category  { name, url }                       optional
 *   duration  e.g. '10 Weeks'                     optional
 *   lessons   number of lessons                   optional
 *   students  number of students                  optional
 *   price     e.g. 'Free' or '₹15,000'            optional: no price, no badge
 */
// Owner's course list (2026-09-30), most in-demand first: ranked by job-market demand
// (job-board openings, competitors' course line-ups). The first entry is the hero featured course.
export const TRENDING_COURSES = [
  {
    id: 'data-analytics-online-training',
    title: 'Data Analytics Online Training',
    url: '/courses/data-analytics-online-training/',
    image: { src: '/images/courses/data-analytics-online-training.webp', width: 1000, height: 600, alt: 'Data Analytics Online Training' },
    category: { name: 'BI', url: '/courses-category/bi/' },
    duration: '10 Weeks',
  },
  {
    id: 'anaplan-online-training',
    title: 'Anaplan Online Training',
    url: '/courses/anaplan-online-training/',
    image: { src: '/wp-content/uploads/2021/03/Anaplan-Online-Training-400x250.jpg', width: 400, height: 250, alt: 'Anaplan Online Training' },
    category: { name: 'Cloud Computing', url: '/courses-category/cloud-computing/' },
    duration: '10 Weeks',
  },
  {
    id: 'epbcs-online-training',
    title: 'EPBCS Online Training',
    url: '/courses/epbcs-online-training/',
    image: { src: '/wp-content/uploads/2021/03/EPBCS-Online-Training-400x250.jpg', width: 400, height: 250, alt: 'EPBCS Online Training' },
    category: { name: 'Hyperion', url: '/courses-category/hyperion/' },
    duration: '10 Weeks',
  },
  {
    id: 'fccs-online-training',
    title: 'FCCS Online Training',
    url: '/courses/fccs-online-training/',
    image: { src: '/wp-content/uploads/2021/03/FCCS-Online-Training-400x250.jpg', width: 400, height: 250, alt: 'FCCS Online Training' },
    category: { name: 'Hyperion', url: '/courses-category/hyperion/' },
    duration: '10 Weeks',
  },
  {
    id: 'ibm-mq-online-training',
    title: 'IBM MQ Online Training',
    url: '/courses/ibm-mq-online-training/',
    image: { src: '/images/courses/ibm-mq-online-training.webp', width: 1000, height: 600, alt: 'IBM MQ Online Training' },
    category: { name: 'ETL Tools', url: '/courses-category/etl-tools/' },
    duration: '10 Weeks',
  },
  {
    id: 'arcs-online-training',
    title: 'ARCS Online Training',
    url: '/courses/arcs-online-training/',
    image: { src: '/wp-content/uploads/2021/02/ARCS-Online-Training-400x250.jpg', width: 400, height: 250, alt: 'ARCS Online Training' },
    category: { name: 'Hyperion', url: '/courses-category/hyperion/' },
    duration: '10 Weeks',
  },
  {
    id: 'edmcs-online-training',
    title: 'EDMCS Online Training',
    url: '/courses/edmcs-online-training/',
    image: { src: '/images/courses/edmcs-online-training.webp', width: 1000, height: 600, alt: 'EDMCS Online Training' },
    category: { name: 'Hyperion', url: '/courses-category/hyperion/' },
    duration: '10 Weeks',
  },
  {
    id: 'pcmcs-online-training',
    title: 'PCMCS Online Training',
    url: '/courses/pcmcs-online-training/',
    image: { src: '/images/courses/pcmcs-online-training.webp', width: 1000, height: 600, alt: 'PCMCS Online Training' },
    category: { name: 'Hyperion', url: '/courses-category/hyperion/' },
    duration: '10 Weeks',
  },
  {
    id: 'narrative-reporting-online-training',
    title: 'Narrative Reporting Online Training',
    url: '/courses/narrative-reporting-online-training/',
    image: { src: '/images/courses/narrative-reporting-online-training.webp', width: 1000, height: 600, alt: 'Narrative Reporting Online Training' },
    category: { name: 'Hyperion', url: '/courses-category/hyperion/' },
    duration: '10 Weeks',
  },
];

/**
 * The featured courses are the site's course catalogue: /courses/, the category pages of these
 * courses and the course sidebars list only these, in this order (see lib/featured.js). The other
 * course pages synced from WordPress stay online at their URLs but are not listed anywhere.
 */
export const FEATURED_COURSE_SLUGS = TRENDING_COURSES.map((c) => c.id);
