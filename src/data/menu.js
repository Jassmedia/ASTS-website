// Primary navigation, in the exact order/structure of the current site.
// pageId = WordPress page id (used for the current_page_item / page-item-N classes).
export const PRIMARY_MENU = [
  { id: 2115, label: 'Home', url: '/', pageId: 1844, home: true },
  {
    id: 21,
    label: 'About',
    url: '/about-asts-training/',
    pageId: 10,
    children: [{ id: 1072, label: 'Testimonials', url: '/about-asts-training/testimonials/', pageId: 1070 }],
  },
  { id: 5297, label: 'Courses', url: '/courses/', pageId: null, archive: true },
  { id: 374, label: 'Blog', url: '/blog/', pageId: 371 },
  {
    id: 165,
    label: 'Registration',
    url: '/registration/',
    pageId: 144,
    children: [
      { id: 167, label: 'Student Registration', url: '/student-registration/', pageId: 146 },
      { id: 166, label: 'Faculty Registration', url: '/faculty-registration/', pageId: 148 },
    ],
  },
  {
    id: 161,
    label: 'Services',
    url: '/services/',
    pageId: 150,
    children: [
      { id: 164, label: 'Online Training', url: '/online-training/', pageId: 152 },
      { id: 163, label: 'Corporate Training', url: '/corporate-training/', pageId: 154 },
      { id: 162, label: 'Project Support', url: '/project-support/', pageId: 156 },
    ],
  },
  { id: 160, label: 'Payment', url: '/payment/', pageId: 158 },
  { id: 23, label: 'Contact', url: '/contact/', pageId: 11 },
];

const norm = (p) => (p || '/').replace(/\/+$/, '') + '/';

/**
 * Builds the WordPress menu item class list for one item given the current path,
 * matching the classes WordPress prints on the current site:
 *  - current page:            current-menu-item page_item page-item-N current_page_item
 *  - parent of current page:  current-menu-ancestor current-menu-parent current_page_parent current_page_ancestor
 *  - "Courses" on /courses/:  current-menu-item current_page_item
 *  - "Courses" on a course:   current_page_parent
 */
export function menuItemClasses(item, currentPath) {
  const cur = norm(currentPath);
  const cls = ['menu-item', 'menu-item-type-post_type', 'menu-item-object-page'];
  if (item.home) cls.push('menu-item-home');
  const isCurrent = norm(item.url) === cur;
  const isAncestor = (item.children || []).some((c) => norm(c.url) === cur);
  if (isCurrent) {
    cls.push('current-menu-item');
    if (item.pageId) cls.push('page_item', 'page-item-' + item.pageId);
    cls.push('current_page_item');
  } else if (item.archive && /^\/courses\/.+/.test(cur)) {
    cls.push('current_page_parent');
  }
  if (isAncestor) cls.push('current-menu-ancestor', 'current-menu-parent', 'current_page_parent', 'current_page_ancestor');
  if (item.children) cls.push('menu-item-has-children');
  cls.push('menu-item-' + item.id);
  return cls.join(' ');
}
