// Site-wide constants captured from the current site (do not invent values here).
export const SITE = {
  name: 'ASTSTraining',
  origin: 'https://aststraining.com',
  logo: '/wp-content/uploads/2020/11/asts_training.png',
  stickyLogo: '/wp-content/uploads/2020/11/asts_training-1.png',
  footerLogo: '/wp-content/uploads/2017/01/asts-footer.png',
  schemaLogo: 'https://aststraining.com/wp-content/uploads/2020/08/cropped-ASTS-Logo.png',
  address: 'ASTS, Hyderabad-500090. India',
  phone: '+91 86 888 42 717',
  email: 'Contact@aststraining.com',
  emailLower: 'contact@aststraining.com',
  // Values used by the (hidden) homepage contact bar and the floating email icon
  altEmail: 'contact@astsonlinetraining.com',
  altPhone: '+91 9603 704 766',
  copyright: '2020 All Rights Reserved',
  tagline:
    'Amaravathi Soft Tek Sol (ASTS) Is Specially Designed For Online Training.<br>It Allows Freshers And Corporate Employees To Enhance Their Knowledge And Skills To Compete With The Current Industry Standards',
};

export const SOCIAL = {
  facebook: 'https://www.facebook.com/aststrainingonline/',
  twitter: 'https://twitter.com/AstsTraining',
  pinterest: 'https://in.pinterest.com/aststrainingonline/',
  linkedin: 'https://in.linkedin.com/company/aststraining',
  instagram: 'https://www.instagram.com/aststrainingonline?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==',
  youtube: 'https://www.youtube.com/channel/UCUNAFNnfgjtCmPPfKr0b02g',
};

export const TRACKING = {
  gaId: 'UA-100326091-2',
  adsId: 'AW-871173008',
  searchConsole: 'sc-GVVBO_w3sILF8Ao7QtSocBu6ozYnnVnT4Q17g-Yk',
  tidio: 'eqws5nvtzvdolqavuol3gv5hzxn8rarg',
};

// Footer widget columns (exact content of the current footer)
export const FOOTER_COURSES = [
  { label: 'Hyperion', url: '/courses-category/hyperion/' },
  { label: 'Programming', url: '/courses-category/programming/' },
  { label: 'Cloud Computing', url: '/courses-category/cloud-computing/' },
  { label: 'Datascience & ML', url: '/courses-category/datascience-ml/' },
  { label: 'ERP', url: '/courses-category/erp/' },
  { label: 'Digital Marketing', url: '/courses-category/digital-marketing/' },
];
export const FOOTER_SERVICES = [
  { label: 'Online Training', url: '/online-training/' },
  { label: 'Corporate Training', url: '/corporate-training/' },
  { label: 'Project Support', url: '/project-support/' },
];

// Course sidebar widgets (identical on every single course page of the current site)
export const COURSE_SIDEBAR_CATEGORIES = [
  { cls: 'cat-item cat-item-16', label: 'BigData and Analytics', url: '/category/bigdata/' },
  { cls: 'cat-item cat-item-49', label: 'Business Intelligence Tools', url: '/courses-category/business-intelligence-tools/' },
  { cls: 'cat-item cat-item-50', label: 'Cloud Computing', url: '/courses-category/cloud-computing/' },
  { cls: 'cat-item cat-item-51', label: 'DevOps', url: '/courses-category/devops/' },
  { cls: 'cat-item cat-item-54', label: 'Digital Marketing', url: '/courses-category/digital-marketing/' },
  { cls: 'cat-item cat-item-14', label: 'DWH ETL', url: '/courses-category/dwh-etl/' },
  { cls: 'cat-item cat-item-15', label: 'DWH Reporting', url: '/courses-category/dwh-reporting/' },
  { cls: 'cat-item cat-item-11', label: 'Hyperion', url: '/courses-category/hyperion/' },
];
export const EXPLORE_MENU = [
  { id: 2054, label: 'Home', url: '/', cls: 'menu-item-home' },
  { id: 2055, label: 'About', url: '/about-asts-training/' },
  { id: 2056, label: 'Blog', url: '/blog/' },
  { id: 2060, label: 'Services', url: '/services/' },
  { id: 2057, label: 'Contact', url: '/contact/' },
];
// Archive (courses / category) sidebar widgets
export const LATEST_COURSES_MENU = [
  { id: 2061, label: 'AWS Online Training', url: '/courses/aws-online-training/' },
  { id: 2062, label: 'SEO Online Training', url: '/courses/seo-online-training/' },
  { id: 2063, label: 'Hadoop Online Training', url: '/courses/hadoop-online-training/' },
  { id: 2064, label: 'Google Cloud Online Training', url: '/courses/google-cloud-online-training/' },
  { id: 2065, label: 'NodeJS Online Training', url: '/courses/nodejs-online-training/' },
  { id: 2066, label: 'React JS Online Training', url: '/courses/react-js-online-training/' },
];
export const COURSE_CATEGORIES_MENU = [
  { id: 2837, label: 'Digital Marketing', url: '/courses-category/digital-marketing/' },
  { id: 2838, label: 'Hyperion', url: '/courses-category/hyperion/' },
  { id: 2839, label: 'Programming', url: '/courses-category/programming/' },
  { id: 2840, label: 'Cloud Computing', url: '/courses-category/cloud-computing/' },
  { id: 2841, label: 'Datascience & ML', url: '/courses-category/datascience-ml/' },
  { id: 2842, label: 'ERP', url: '/courses-category/erp/' },
];

// Homepage "All Courses" category cards (8 of the 11 categories, in the current order/labels)
export const HOME_CATEGORY_CARDS = [
  { slug: 'bi', name: 'BI', count: '07 Courses', image: '/wp-content/uploads/2020/12/business-intelligence-BI.jpg' },
  { slug: 'cloud-computing', name: 'Cloud Computing', count: '09 Courses', image: '/wp-content/uploads/2020/12/Cloud-Computing-CC.jpg' },
  { slug: 'datascience-ml', name: 'Datascience & ML', count: '04 Courses', image: '/wp-content/uploads/2020/12/Data-Science-ML-Training.jpg' },
  { slug: 'erp', name: 'ERP', count: '10 Courses', image: '/wp-content/uploads/2020/12/ERP-Development-image.jpg' },
  { slug: 'etl-tools', name: 'ETL Tools', count: '07 Courses', image: '/wp-content/uploads/2020/12/etl-tools-to-learn-in-2020.jpg' },
  { slug: 'hyperion', name: 'Hyperion', count: '10 Courses', image: '/wp-content/uploads/2020/12/Hyperion-training-HT.jpg' },
  { slug: 'programming', name: 'Programming', count: '10 Courses', image: '/wp-content/uploads/2020/12/programming-course-training-online.jpg' },
  { slug: 'testing', name: 'Testing', count: '05 Courses', image: '/wp-content/uploads/2020/12/software-testing-training.jpg' },
];

// "Our Training" cards (homepage) and Services page cards
export const TRAINING_CARDS = [
  {
    id: '0fef746',
    col: 'bb693f8',
    title: 'Online Training',
    url: '/online-training/',
    image: '/wp-content/uploads/2020/12/online-learning-02.png',
    alt: 'online-learning-02',
    text: 'Online Training gives comprehensive training from our expert instructors using seamless over the web-connectivity.',
  },
  {
    id: '48a5036',
    col: 'f05a408',
    title: 'Corporate Training',
    url: '/classroom-training/',
    image: '/wp-content/uploads/2020/12/classroom-training-03.png',
    alt: '',
    text: 'Corporate Training gives you a hands-on interactive experience on any technology you choose.',
  },
  {
    id: '60b5e70',
    col: 'a9f5842',
    title: 'Project Support',
    url: '/project-support/',
    image: '/wp-content/uploads/2020/12/project-support-04.png',
    alt: '',
    text: 'Every project is different and therefore the duties of an employee will change accordingly.',
  },
  {
    id: 'ca1abca',
    col: 'f959566',
    title: 'Idea Discussion',
    url: '/idea-discussion/',
    image: '/wp-content/uploads/2020/12/idea-discussion-05.png',
    alt: '',
    text: 'Lorem ipsum dolor sit amet, of consectetur adipiscing elit. is dictum risus non suscip',
  },
];
export const SERVICES_PAGE_CARDS = [
  { id: 'ad5e261', col: '321d70a', title: 'Online Training', url: '/online-training/', image: '/wp-content/uploads/2020/12/online-learning-02.png', alt: 'online-learning-02', text: TRAINING_CARDS[0].text },
  { id: '4649a2c', col: '8b9afe2', title: 'Classroom Training', url: '/classroom-training/', image: '/wp-content/uploads/2020/12/classroom-training-03.png', alt: '', text: 'Classroom Training gives you a hands-on interactive experience on any technology you choose.' },
  { id: '9d9f02e', col: 'afab84c', title: 'Project Support', url: '/project-support/', image: '/wp-content/uploads/2020/12/project-support-04.png', alt: '', text: TRAINING_CARDS[2].text },
  { id: '5fb97e0', col: 'c19a95e', title: 'Idea Discussion', url: '/idea-discussion/', image: '/wp-content/uploads/2020/12/idea-discussion-05.png', alt: '', text: TRAINING_CARDS[3].text },
];

// "Why Choose ASTS?" cards (left column then right column, with the live animation settings)
export const WHY_CHOOSE = {
  left: [
    { id: 'ac63573', delay: 100, anim: 'fadeInLeft', image: '/wp-content/uploads/2021/01/White-08.png', title: 'Learn from the Experienced', text: 'Industry Professionals help you to master the latest skills with emphasis on Real-Time Scenarios.' },
    { id: 'ed1f26b', delay: 200, anim: 'fadeInLeft', image: '/wp-content/uploads/2021/01/White-09.png', title: '24*7 Global Support', text: 'Learn round-the-clock without having to travel, at your convenience of both Time and Place.' },
    { id: '5d0d6b9', delay: 300, anim: 'fadeInLeft', image: '/wp-content/uploads/2021/01/White-10.png', title: 'Competitive Pricing', text: 'All our offerings come with Economical Pricing and even discounts based on Team size/Course.' },
    { id: '1586f7a', delay: 400, anim: 'fadeInLeft', image: '/wp-content/uploads/2021/01/White-11.png', title: 'Modular Training', text: 'Fast Track Courses for quick Skill Development of time-constrained working professionals.' },
  ],
  right: [
    { id: 'ef12d10', delay: 100, anim: 'fadeInRight', image: '/wp-content/uploads/2021/01/White-12.png', title: 'Personalized Approach', text: 'Enables greater productivity for slow-learners and novices with flexible Course Delivery methods.' },
    { id: 'e36180a', delay: 200, anim: 'fadeInRight', image: '/wp-content/uploads/2021/01/White-13.png', title: 'Learning Environment', text: 'Benefit from Smaller Batch Sizes, Latest Learning Tools, and Industry Standard Facilities.' },
    { id: 'e680ad6', delay: 300, anim: 'fadeInRight', image: '/wp-content/uploads/2021/01/White-14.png', title: 'Track Record', text: '85% of our Trainees would recommend us as a great place to learn Technology and improve Skills.' },
  ],
};

export const COUNTERS = [
  { id: '643099d', col: '10b1ad0', value: 50, prefix: 'k', title: 'Finished Sessions' },
  { id: 'f2f23fe', col: '6255a82', value: 70, prefix: 'k+', title: 'Enrolled Learners' },
  { id: '8b4738e', col: '08d8d93', value: 120, prefix: '+', title: 'Online Instructors' },
  { id: '1b2d837', col: '2d1e6d5', value: 100, prefix: '%', title: 'Satisfaction Rate' },
];

export const HERO_SLIDES = [
  { key: 'rs-1', title: 'Slide', image: '/wp-content/uploads/2020/12/Home-dot-bg.jpg', imgTitle: 'Home-dot-bg', layerId: 1 },
  { key: 'rs-8', title: 'New Slider', image: '/wp-content/uploads/2020/12/Slider-22.jpg', imgTitle: 'Slider-22', layerId: 8 },
  { key: 'rs-10', title: 'New Slider', image: '/wp-content/uploads/2020/12/Slider-33.jpg', imgTitle: 'Slider-33', layerId: 10 },
];
