import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HERO_SLIDES } from '../../data/site';

/*
 * Re-implementation of the homepage Slider Revolution module ("rev_slider_1_1"):
 * 3 slides, fade transition (1000ms), 9s autoplay, "zeus" arrows (hidden under
 * 778px), one text/search/quote layer set per slide, and the plugin's responsive
 * levels (1240 / 1024 / 778 / 480) with the exact per-level layer geometry that
 * the live slider markup declares (data-xy, data-text, data-dim, data-frame_1).
 */
const LEVELS = [
  { minW: 1240, gridW: 1240, gridH: 750, title: { top: 236, xo: 10, fs: 78, lh: 85, ls: -3 }, quote: { top: 326, xo: 2, fs: 24, lh: 40, w: 'auto' }, form: { top: 522, fx: 10, fy: -78, fs: 20, lh: 25, w: 589 } },
  { minW: 1024, gridW: 1024, gridH: 800, title: { top: 195, xo: 0, fs: 64, lh: 70, ls: -2 }, quote: { top: 286, xo: 0, fs: 19, lh: 33, w: 514 }, form: { top: 457, fx: 8, fy: -64, fs: 16, lh: 20, w: 486 } },
  { minW: 778, gridW: 778, gridH: 700, title: { top: 208, xo: 0, fs: 48, lh: 37, ls: -1 }, quote: { top: 275, xo: 0, fs: 18, lh: 28, w: 496 }, form: { top: 415, fx: 6, fy: -48, fs: 12, lh: 15, w: 369 } },
  { minW: 0, gridW: 480, gridH: 700, title: { top: 259, xo: 0, fs: 36, lh: 42, ls: 0 }, quote: { top: 309, xo: 0, fs: 16, lh: 22, w: 'auto' }, form: { top: 410, fx: 3, fy: -29, fs: 7, lh: 9, w: 423 } },
];
const AUTOPLAY_MS = 9000;

function computeLayout(width) {
  const level = LEVELS.find((l) => width >= l.minW) || LEVELS[LEVELS.length - 1];
  const scale = Math.min(1, width / level.gridW);
  return { level, scale, width };
}

export default function HeroSlider() {
  const [layout, setLayout] = useState(() => computeLayout(1240));
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    const update = () => setLayout(computeLayout(document.documentElement.clientWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const go = useCallback((dir) => {
    setActive((a) => (a + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    setCycle((c) => c + 1);
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(timer.current);
  }, [go, cycle]);

  const { level, scale, width } = layout;
  const height = Math.round(level.gridH * scale);
  const gridLeft = Math.round((width - level.gridW * scale) / 2);

  return (
    <>
      <p className="rs-p-wp-fix"></p>
      <div id="rev_slider_1_1_wrapper" data-source="gallery" style={{ height }}>
        <div id="rev_slider_1_1" data-version="6.3.1">
          {HERO_SLIDES.map((s, i) => (
            <div key={s.key} className={'hero-slide' + (i === active ? ' active' : '')} data-key={s.key} data-title={s.title}>
              <img src={s.image} title={s.imgTitle} width="1920" height="960" data-parallax="off" className="rev-slidebg" data-no-retina="" alt="" />
              <div className="hero-grid" style={{ width: level.gridW, height: level.gridH, left: gridLeft, transform: `scale(${scale})` }}>
                <h3
                  id={`slider-1-slide-${s.layerId}-layer-0`}
                  className="hero-layer hero-title"
                  style={{ top: level.title.top, marginLeft: level.title.xo, fontSize: level.title.fs, lineHeight: level.title.lh + 'px', letterSpacing: level.title.ls }}
                >
                  <span className="hero-mask">
                    <span key={cycle}>ASTS - Online Training</span>
                  </span>
                </h3>
                <div
                  id={`slider-1-slide-${s.layerId}-layer-10`}
                  key={'q' + cycle}
                  className="hero-layer hero-quote"
                  style={{ top: level.quote.top, marginLeft: level.quote.xo, fontSize: level.quote.fs, lineHeight: level.quote.lh + 'px', width: level.quote.w, whiteSpace: level.quote.w === 'auto' ? 'nowrap' : 'normal' }}
                >
                  Every act of conscious learning requires the willingness to
                  <br />
                  suffer an injury to one’s self-esteem during COVID-19.
                </div>
                <div
                  id={`slider-1-slide-${s.layerId}-layer-2`}
                  key={'f' + cycle}
                  className="hero-layer hero-search"
                  style={{ top: level.form.top, fontSize: level.form.fs, lineHeight: level.form.lh + 'px', width: level.form.w, '--hero-fx': level.form.fx + 'px', '--hero-fy': level.form.fy + 'px' }}
                >
                  <form role="search" method="get" id="searchform" className="revtp-searchform" action="/">
                    <input type="text" className="main-search" defaultValue="" name="s" id="s" placeholder="What do you want to learn?" />
                    <input className="btn-search" type="submit" id="searchsubmit" value="Search" />
                  </form>
                </div>
              </div>
            </div>
          ))}
          <div className="tparrows zeus tp-leftarrow" onClick={() => go(-1)} role="button" aria-label="Previous slide">
            <div className="tp-title-wrap">
              <div className="tp-arr-imgholder"></div>
            </div>
          </div>
          <div className="tparrows zeus tp-rightarrow" onClick={() => go(1)} role="button" aria-label="Next slide">
            <div className="tp-title-wrap">
              <div className="tp-arr-imgholder"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
