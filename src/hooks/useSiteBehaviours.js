import { useEffect } from 'react';

/**
 * Sticky header, exactly like the theme's main.js:
 * once the page is scrolled past the header height the `.header-inner.menu-sticky`
 * element gets the `sticky` class (the theme CSS then fixes it to the top).
 * The jQuery Waypoints "sticky" shortcut also adds `stuck`; both are applied.
 */
export function useStickyHeader(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const headerHeight = el.offsetHeight;
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      if (y < headerHeight) {
        el.classList.remove('sticky');
        el.classList.remove('stuck');
      } else {
        el.classList.add('sticky');
        el.classList.add('stuck');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [ref]);
}

/**
 * Elementor "stretch section": sections with .elementor-section-stretched are
 * widened to the viewport width and pulled to the left edge (as Elementor's
 * frontend script does), re-evaluated on resize and on every route change.
 */
export function useElementorStretch(dep) {
  useEffect(() => {
    const apply = () => {
      const width = document.documentElement.clientWidth;
      document.querySelectorAll('.elementor-section-stretched').forEach((el) => {
        el.style.width = '';
        el.style.left = '';
        const left = el.getBoundingClientRect().left;
        el.style.width = width + 'px';
        el.style.left = -left + 'px';
      });
    };
    apply();
    const t = setTimeout(apply, 250);
    window.addEventListener('resize', apply);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', apply);
    };
  }, [dep]);
}

/**
 * Elementor entrance animations: elements rendered with .elementor-invisible get
 * `animated <name>` (and lose .elementor-invisible) once they scroll into view,
 * honouring the per-element delay, like Elementor's frontend does.
 * Elements declare data-animation / data-animation-delay.
 */
export function useElementorAnimations(dep) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.elementor-invisible'));
    if (!els.length || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.remove('elementor-invisible'));
      return undefined;
    }
    const timers = [];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          io.unobserve(el);
          const name = el.getAttribute('data-animation') || 'fadeInUp';
          const delay = parseInt(el.getAttribute('data-animation-delay') || '0', 10);
          timers.push(
            setTimeout(() => {
              el.classList.remove('elementor-invisible');
              el.classList.add('animated', name);
            }, delay),
          );
        });
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [dep]);
}

/**
 * jQuery tilt equivalent for `.titlt[data-tilt]` images (maxTilt from data-tilt-max,
 * perspective 1000px, 300ms ease-out on enter/leave), as the tilt.jquery plugin
 * auto-initialises on the current site.
 */
export function useTilt(dep) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-tilt]'));
    const cleanups = els.map((el) => {
      const max = parseFloat(el.getAttribute('data-tilt-max') || '20');
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const tiltX = (max / 2 - px * max).toFixed(2);
        const tiltY = (py * max - max / 2).toFixed(2);
        el.style.transition = '';
        el.style.transform = `perspective(1000px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) scale3d(1,1,1)`;
      };
      const onEnter = () => {
        el.style.transition = 'transform 300ms cubic-bezier(.03,.98,.52,.99)';
        setTimeout(() => {
          el.style.transition = '';
        }, 300);
      };
      const onLeave = () => {
        el.style.transition = 'transform 300ms cubic-bezier(.03,.98,.52,.99)';
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [dep]);
}
