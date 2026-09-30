/**
 * Courses in the homepage "Trending Courses" grid. The same list drives the Services page
 * course grid, and the first entry is the featured course card in the homepage hero.
 * Cards render only what is defined here: edit this list to change names, images or order.
 *
 *   id        unique key (e.g. the course slug)
 *   title     course name shown on the card
 *   url       page the card and its "View Course" link open
 *   image     { src, width, height, alt }. The tiles in public/images/courses/<id>.webp are drawn
 *             from each course's title by `npm run gen:course-tiles`: re-run it after adding or
 *             renaming a course. A custom image can go in the same folder instead.
 *   category  { name, url }                       optional
 *   duration  e.g. '10 Weeks'                     optional
 *   lessons   number of lessons                   optional
 *   students  number of students                  optional
 *   price     e.g. 'Free' or '₹15,000'            optional: no price, no badge
 */
export const TRENDING_COURSES = [
  {
    id: 'python-online-training',
    title: 'Python Online Training',
    url: '/courses/python-online-training/',
    image: { src: '/images/courses/python-online-training.webp', width: 1000, height: 600, alt: 'Python Online Training' },
    category: { name: 'Programming', url: '/courses-category/programming/' },
    duration: '10 Weeks',
    lessons: 10,
    students: 122,
  },
  {
    id: 'ruby-on-rails-online-training',
    title: 'Ruby On Rails Online Training',
    url: '/courses/ruby-on-rails-online-training/',
    image: { src: '/images/courses/ruby-on-rails-online-training.webp', width: 1000, height: 600, alt: 'Ruby On Rails Online Training' },
    category: { name: 'Programming', url: '/courses-category/programming/' },
    duration: '10 Weeks',
    lessons: 27,
    students: 0,
  },
  {
    id: 'akka-with-scala-online-training',
    title: 'Akka With Scala Online Training',
    url: '/courses/akka-with-scala-online-training/',
    image: { src: '/images/courses/akka-with-scala-online-training.webp', width: 1000, height: 600, alt: 'Akka With Scala Online Training' },
    category: { name: 'Programming', url: '/courses-category/programming/' },
    duration: '10 Weeks',
    lessons: 6,
    students: 0,
  },
  {
    id: 'angularjs-online-training',
    title: 'AngularJs Online Training',
    url: '/courses/angularjs-online-training/',
    image: { src: '/images/courses/angularjs-online-training.webp', width: 1000, height: 600, alt: 'AngularJs Online Training' },
    category: { name: 'Programming', url: '/courses-category/programming/' },
    duration: '10 Weeks',
    lessons: 4,
    students: 0,
  },
  {
    id: 'dot-net-online-training',
    title: 'Dot Net Online Training',
    url: '/courses/dot-net-online-training/',
    image: { src: '/images/courses/dot-net-online-training.webp', width: 1000, height: 600, alt: 'Dot Net Online Training' },
    category: { name: 'Programming', url: '/courses-category/programming/' },
    duration: '10 Weeks',
    lessons: 38,
    students: 0,
  },
  {
    id: 'django-online-training',
    title: 'Django Online Training',
    url: '/courses/django-online-training/',
    image: { src: '/images/courses/django-online-training.webp', width: 1000, height: 600, alt: 'Django Online Training' },
    category: { name: 'Programming', url: '/courses-category/programming/' },
    duration: '10 Weeks',
    lessons: 31,
    students: 0,
  },
  {
    id: 'java-online-training',
    title: 'Java Online Training',
    url: '/courses/java-online-training/',
    image: { src: '/images/courses/java-online-training.webp', width: 1000, height: 600, alt: 'Java Online Training' },
    category: { name: 'Programming', url: '/courses-category/programming/' },
    duration: '10 Weeks',
    lessons: 23,
    students: 1,
  },
  {
    id: 'jquery-online-training',
    title: 'Jquery Online Training',
    url: '/courses/jquery-online-training/',
    image: { src: '/images/courses/jquery-online-training.webp', width: 1000, height: 600, alt: 'Jquery Online Training' },
    category: { name: 'Programming', url: '/courses-category/programming/' },
    duration: '10 Weeks',
    lessons: 12,
    students: 0,
  },
];
