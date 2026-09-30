import React, { useEffect, useState } from 'react';

/**
 * Minimal re-implementation of the slick carousel as configured by the RS
 * Elements testimonial widget on the current site (its init script leaves
 * slick's default `infinite: true`, with dots, no arrows and no autoplay).
 * It prints the same DOM/classes slick generates so the theme CSS applies:
 * .slick-slider > .slick-list > .slick-track > .slick-slide (with .slick-cloned
 * copies at both ends), plus .slick-dots.
 *
 * Widths/offsets are percentage based so the server-rendered HTML matches.
 * The theme gives every .slick-slide a horizontal margin (15px each side);
 * like slick, the slide's width is the pitch minus those margins.
 */
function slidesToShowFor(width, cols) {
  if (width < 768) return cols.xs;
  if (width < 992) return cols.sm;
  if (width < 1200) return cols.md;
  return cols.lg;
}

export default function SlickSlider({ id, className = 'rs-addon-slider', children, cols = { lg: 2, md: 2, sm: 1, xs: 1 }, slidesToScroll = 2, dots = true, slideMargin = 15 }) {
  const slides = React.Children.toArray(children);
  const n = slides.length;
  const [show, setShow] = useState(cols.lg);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const update = () => setShow(slidesToShowFor(document.documentElement.clientWidth, cols));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [cols]);

  const visible = Math.min(show, n);
  const pages = Math.max(1, Math.ceil(n / slidesToScroll));
  const current = Math.min(page, pages - 1);
  const first = current * slidesToScroll; // may run past the end: clones fill in (infinite mode)
  const clones = visible; // slick clones `slidesToShow` slides at each end
  const total = n + 2 * clones;
  const trackWidth = (total / visible) * 100; // percent of the list
  const pitch = 100 / total; // percent of the track
  const offset = (clones + first) * pitch;
  const width = slideMargin ? `calc(${pitch}% - ${2 * slideMargin}px)` : pitch + '%';

  const renderSlide = (child, index, key, cloned) => {
    const isActive = !cloned && index >= first && index < first + visible;
    const activeClone = cloned && index >= n && index < first + visible;
    return React.cloneElement(child, {
      key,
      className: [child.props.className, 'slick-slide', cloned ? 'slick-cloned' : '', !cloned && index === first ? 'slick-current' : '', isActive || activeClone ? 'slick-active' : ''].filter(Boolean).join(' '),
      'data-slick-index': index,
      'aria-hidden': isActive || activeClone ? 'false' : 'true',
      style: { ...(child.props.style || {}), width },
    });
  };

  return (
    <div id={id} className={className + ' slick-initialized slick-slider' + (dots ? ' slick-dotted' : '')}>
      <div className="slick-list draggable">
        <div className="slick-track" style={{ opacity: 1, width: trackWidth + '%', transform: `translate3d(-${offset}%, 0px, 0px)` }}>
          {slides.slice(n - clones).map((child, i) => renderSlide(child, i - clones, 'pre-' + i, true))}
          {slides.map((child, i) => renderSlide(child, i, 'slide-' + i, false))}
          {slides.slice(0, clones).map((child, i) => renderSlide(child, n + i, 'post-' + i, true))}
        </div>
      </div>
      {dots ? (
        <ul className="slick-dots" role="tablist">
          {Array.from({ length: pages }, (_, p) => (
            <li key={p} className={p === current ? 'slick-active' : ''} role="presentation">
              <button type="button" role="tab" aria-selected={p === current ? 'true' : 'false'} onClick={() => setPage(p)}>
                {p + 1}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
