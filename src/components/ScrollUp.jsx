import React, { useEffect, useState } from 'react';

/** "Back to top" button (#scrollUp), shown after 150px of scrolling like the theme's main.js. */
export default function ScrollUp() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible((window.scrollY || window.pageYOffset) > 150);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      id="scrollUp"
      style={{ display: visible ? 'block' : 'none' }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <i className="fa fa-angle-up"></i>
    </div>
  );
}
