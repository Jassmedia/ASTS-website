import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../site/Icons';
import ContactBar from '../ContactBar';
import { COUNTERS, HOME_CATEGORY_CARDS, TRAINING_CARDS, WHY_CHOOSE } from '../../data/site';
import { TRENDING_COURSES } from '../../data/trending-courses';
import testimonials from '../../data/testimonials.json';

/*
 * Redesigned homepage. Content (headings, text, counters, cards, links) comes
 * from the same data as before; only layout, typography and imagery are new.
 * New photos live in /images/home/ (Unsplash licence, see IMAGE-CREDITS.md).
 */

const IMG = '/images/home/';
const CATEGORY_IMAGES = {
  bi: ['category-business-intelligence.webp', 'Analytics dashboard with performance charts on a laptop'],
  'cloud-computing': ['category-cloud-computing.webp', 'Server racks with network cabling in a data centre'],
  'datascience-ml': ['category-data-science.webp', 'Data dashboards with charts on a monitor'],
  erp: ['category-erp.webp', 'Professionals working with laptops in a large training room'],
  'etl-tools': ['category-etl-tools.webp', 'Network patch panel with connected data cables'],
  hyperion: ['category-hyperion.webp', 'Financial planning documents with a calculator'],
  programming: ['category-programming.webp', 'Source code on a computer monitor'],
  testing: ['category-testing.webp', 'Two developers reviewing code on monitors in an office'],
};
const TRAINING_EXTRA = {
  '/online-training/': ['training-online.webp', 'Live online class with participants on a video call', 'laptop'],
  '/corporate-training/': ['training-corporate.webp', 'Trainer presenting to a corporate group with laptops', 'building'],
  '/project-support/': ['training-project-support.webp', 'Team collaborating on a project around laptops', 'lifeBuoy'],
  '/idea-discussion/': ['training-idea-discussion.webp', 'Two people sketching ideas on a whiteboard', 'bulb'],
};
const WHY_ICONS = {
  'Learn from the Experienced': 'teacher',
  '24*7 Global Support': 'headset',
  'Competitive Pricing': 'tag',
  'Modular Training': 'layers',
  'Personalized Approach': 'userCheck',
  'Learning Environment': 'school',
  'Track Record': 'award',
};
const STAT_ICONS = ['signal', 'graduation', 'teacher', 'award'];

const has = (v) => v !== undefined && v !== null && v !== '';
// 10 -> "10 lessons", 1 -> "1 lesson"; text is shown as given.
const countLabel = (n, word) => (typeof n === 'number' ? `${n} ${word}${n === 1 ? '' : 's'}` : n);
const counterParts = (c) => (c.prefix.startsWith('k') ? ['k', c.prefix.slice(1)] : ['', c.prefix]);
const COUNTER_TEXT = (c) => {
  const [unit, plus] = counterParts(c);
  return (
    <>
      {c.value}
      {unit}
      <span>{plus}</span>
    </>
  );
};
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Adds .is-visible to [data-reveal] elements as they scroll into view. */
function useReveal(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const els = Array.from(root.querySelectorAll('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}

const delay = (i) => ({ '--nx-delay': `${(i % 4) * 70}ms` });

function SectionHead({ title, eyebrow, lead, action, center, light }) {
  return (
    <div className={'nx-section-head' + (center ? ' is-center' : '') + (light ? ' is-light' : '')} data-reveal="">
      <div>
        {eyebrow ? <span className="nx-eyebrow">{eyebrow}</span> : null}
        <h2 className="nx-h2">{title}</h2>
        {lead ? <p className="nx-lead">{lead}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Hero() {
  const featured = TRENDING_COURSES[0];
  return (
    <section className="nx-hero">
      <div className="nx-hero-grid-bg" aria-hidden="true"></div>
      <div className="nx-container nx-hero-grid">
        <div className="nx-hero-copy">
          <span className="nx-eyebrow">Amaravathi Soft Tek Sol (ASTS)</span>
          <h3 className="nx-hero-title">
            ASTS - <em>Online Training</em>
          </h3>
          <form role="search" method="get" id="searchform" className="nx-search" action="/">
            <Icon name="search" />
            <input type="text" defaultValue="" name="s" id="s" placeholder="What do you want to learn?" aria-label="What do you want to learn?" />
            <input type="submit" id="searchsubmit" value="Search" />
          </form>
          <div className="nx-hero-actions">
            <Link to="/courses/" className="nx-btn nx-btn-primary">
              View All Courses <Icon name="arrowRight" className="nx-arrow" />
            </Link>
            <Link to="/student-registration/" className="nx-btn nx-btn-ghost-light">
              Student Registration
            </Link>
          </div>
          <div className="nx-chips">
            {HOME_CATEGORY_CARDS.map((c) => (
              <Link key={c.slug} to={'/courses-category/' + c.slug + '/'} className="nx-chip">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="nx-hero-media">
          <div className="nx-hero-ring" aria-hidden="true"></div>
          <img
            src={IMG + 'hero-students-learning-1920.webp'}
            srcSet={`${IMG}hero-students-learning-960.webp 960w, ${IMG}hero-students-learning-1920.webp 1920w`}
            sizes="(max-width: 991px) 100vw, 50vw"
            width="1920"
            height="1200"
            alt="Students learning together around a laptop"
            fetchpriority="high"
            decoding="async"
          />
          <div className="nx-hero-float nx-float-a">
            <div className="nx-hero-float-icon">
              <Icon name="graduation" />
            </div>
            <div>
              <strong>{COUNTER_TEXT(COUNTERS[1])}</strong>
              <small>{COUNTERS[1].title}</small>
            </div>
          </div>
          <div className="nx-hero-float nx-float-b">
            <div className="nx-hero-float-icon is-navy">
              <Icon name="teacher" />
            </div>
            <div>
              <strong>{COUNTER_TEXT(COUNTERS[2])}</strong>
              <small>{COUNTERS[2].title}</small>
            </div>
          </div>
          {featured ? (
            <Link to={featured.url} className="nx-hero-course" tabIndex={-1} aria-hidden="true">
              <img src={featured.image.src} alt="" width={featured.image.width} height={featured.image.height} decoding="async" />
              <div>
                <small>{featured.category ? featured.category.name : 'Trending Courses'}</small>
                <strong>{featured.title}</strong>
                {featured.duration ? (
                  <span>
                    <Icon name="clock" /> {featured.duration}
                  </span>
                ) : null}
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Counts up to the final value when it scrolls into view (final value is server-rendered). */
function StatValue({ c }) {
  const ref = useRef(null);
  const [n, setN] = useState(c.value);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !('IntersectionObserver' in window)) return undefined;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1400;
        const tick = (t) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.round(c.value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [c.value]);
  const [unit, plus] = counterParts(c);
  return (
    <div className="nx-stat-value" ref={ref}>
      {n}
      {unit}
      <span>{plus}</span>
    </div>
  );
}

function Stats() {
  return (
    <div className="nx-stats">
      <div className="nx-container">
        <div className="nx-stats-grid" data-reveal="">
          {COUNTERS.map((c, i) => (
            <div key={c.id} className="nx-stat">
              <div className="nx-stat-icon">
                <Icon name={STAT_ICONS[i]} />
              </div>
              <div>
                <StatValue c={c} />
                <div className="nx-stat-label">{c.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Categories() {
  return (
    <section className="nx-section">
      <div className="nx-container">
        <SectionHead
          title="All Courses"
          action={
            <Link to="/courses/" className="nx-btn nx-btn-outline">
              VIEW ALL COURSES <Icon name="arrowRight" className="nx-arrow" />
            </Link>
          }
        />
        <div className="nx-grid nx-grid-4">
          {HOME_CATEGORY_CARDS.map((c, i) => {
            const url = '/courses-category/' + c.slug + '/';
            const [file, alt] = CATEGORY_IMAGES[c.slug];
            return (
              <article key={c.slug} className="nx-card nx-cat-card" data-reveal="" style={delay(i)}>
                <Link to={url} className="nx-card-media" tabIndex={-1} aria-hidden="true">
                  <img src={IMG + file} alt={alt} width="800" height="540" loading="lazy" decoding="async" />
                  <span className="nx-cat-count">{c.count}</span>
                </Link>
                <div className="nx-card-body">
                  <h3 className="nx-card-title">
                    <Link to={url}>{c.name}</Link>
                  </h3>
                  <Link to={url} className="nx-card-link">
                    View More <Icon name="arrowRight" className="nx-arrow" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Training() {
  return (
    <section className="nx-section nx-section-alt">
      <div className="nx-container">
        <SectionHead title="Our Training" center />
        <div className="nx-grid nx-grid-4">
          {TRAINING_CARDS.map((c, i) => {
            const [file, alt, icon] = TRAINING_EXTRA[c.url];
            return (
              <article key={c.id} className="nx-card nx-train-card" data-reveal="" style={delay(i)}>
                <Link to={c.url} className="nx-card-media" tabIndex={-1} aria-hidden="true">
                  <img src={IMG + file} alt={alt} width="800" height="540" loading="lazy" decoding="async" />
                </Link>
                <div className="nx-card-body">
                  <div className="nx-train-icon">
                    <Icon name={icon} />
                  </div>
                  <h3 className="nx-card-title">
                    <Link to={c.url}>{c.title}</Link>
                  </h3>
                  <p className="nx-card-text">{c.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** One "Trending Courses" card; everything it shows comes from the course object. */
function CourseCard({ course, index }) {
  const { url, image, category, price } = course;
  return (
    <article className="nx-card nx-course-card" data-reveal="" style={delay(index)}>
      <Link to={url} className="nx-card-media" tabIndex={-1} aria-hidden="true">
        <img src={image.src} alt={image.alt || course.title} width={image.width} height={image.height} loading="lazy" decoding="async" />
        {price ? <span className="nx-course-free">{price}</span> : null}
      </Link>
      <div className="nx-card-body">
        {category ? (
          <Link to={category.url} rel="tag" className="nx-course-cat">
            {category.name}
          </Link>
        ) : null}
        <h3 className="nx-card-title">
          <Link to={url}>{course.title}</Link>
        </h3>
        <ul className="nx-course-facts">
          {has(course.duration) ? (
            <li>
              <Icon name="clock" /> {course.duration}
            </li>
          ) : null}
          {has(course.lessons) ? (
            <li>
              <Icon name="book" /> {countLabel(course.lessons, 'lesson')}
            </li>
          ) : null}
          {has(course.students) ? (
            <li>
              <Icon name="users" /> {countLabel(course.students, 'student')}
            </li>
          ) : null}
        </ul>
        <Link to={url} className="nx-card-link">
          View Course <Icon name="arrowRight" className="nx-arrow" />
        </Link>
      </div>
    </article>
  );
}

function Trending() {
  return (
    <section className="nx-section">
      <div className="nx-container">
        <SectionHead
          title="Trending Courses"
          action={
            <Link to="/courses/" className="nx-btn nx-btn-outline">
              VIEW ALL COURSES <Icon name="arrowRight" className="nx-arrow" />
            </Link>
          }
        />
        <div className="nx-grid nx-grid-3">
          {TRENDING_COURSES.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="nx-section nx-section-alt">
      <div className="nx-container nx-about">
        <div className="nx-about-media" data-reveal="">
          <img src={IMG + 'about-mentor-training.webp'} alt="Mentor guiding a student at a computer" width="900" height="700" loading="lazy" decoding="async" />
          <div className="nx-about-badge">
            <strong>{COUNTER_TEXT(COUNTERS[3])}</strong>
            <small>{COUNTERS[3].title}</small>
          </div>
        </div>
        <div className="nx-about-copy" data-reveal="" style={delay(1)}>
          <span className="nx-eyebrow">ASTS</span>
          <h2 className="nx-h2">About Us</h2>
          <p>Amaravathi Soft Tek Sol (ASTS) Is Specially Designed For Online Training.</p>
          <p>It Allows Freshers And Corporate Employees To Enhance Their Knowledge And Skills To Compete With The Current Industry Standards.</p>
          <p>ASTS Is Always Determined To Empower Their Trainees To Meet Their Goals.</p>
          <p>It Provides The Finest Training In Hyperion, SAP, Oracle And In Reporting Tools. Our ASTS Is The Ultimate Destination For Those Who Wish To Deliver Their Optimum Skills To The Organization.</p>
          <ul className="nx-about-tags" aria-hidden="true">
            {['Hyperion', 'SAP', 'Oracle', 'Reporting Tools'].map((t) => (
              <li key={t}>
                <Icon name="check" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function WhyChoose() {
  const items = [...WHY_CHOOSE.left, ...WHY_CHOOSE.right];
  return (
    <section className="nx-section nx-why">
      <div className="nx-container">
        <SectionHead title="Why Choose ASTS?" center />
        <div className="nx-why-grid">
          {items.map((c, i) => (
            <div key={c.id} className="nx-why-item" data-reveal="" style={delay(i)}>
              <div className="nx-why-icon">
                <Icon name={WHY_ICONS[c.title] || 'award'} />
              </div>
              <h2>{c.title}</h2>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false, overflow: false });
  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4, overflow: max > 4 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);
  const go = (dir) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('.nx-quote');
    el.scrollBy({ left: dir * (card ? card.offsetWidth + 20 : el.clientWidth), behavior: reducedMotion() ? 'auto' : 'smooth' });
  };
  return (
    <section className="nx-section">
      <div className="nx-container">
        <SectionHead
          eyebrow="WHAT OUR STUDENTS"
          title="Clients have to say about ASTS"
          center
        />
        <div className="nx-quotes" ref={track} onScroll={update}>
          {testimonials.map((t, i) => (
            <figure key={t.slug} className="nx-quote" data-reveal="" style={delay(i)}>
              <svg className="nx-quote-mark" width="34" height="26" viewBox="0 0 34 26" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M0 26V15.6C0 6.9 4.6 1.7 13.6 0l1.5 3.3C10.3 4.9 8 7.9 7.8 12H14v14H0Zm19 0V15.6C19 6.9 23.6 1.7 32.6 0l1.4 3.3c-4.7 1.6-7 4.6-7.2 8.7H33v14H19Z" />
              </svg>
              <p>{t.text}</p>
              <figcaption className="nx-quote-person">
                <span className="nx-avatar" aria-hidden="true">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <h4>{t.name}</h4>
                  <span className="nx-quote-role">{t.designation}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        {edge.overflow ? (
          <div className="nx-carousel-nav">
            <button type="button" className="nx-round-btn" onClick={() => go(-1)} disabled={edge.start} aria-label="Previous testimonial">
              <Icon name="chevronLeft" />
            </button>
            <button type="button" className="nx-round-btn" onClick={() => go(1)} disabled={edge.end} aria-label="Next testimonial">
              <Icon name="chevronRight" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="nx-section nx-cta-section">
      <div className="nx-container">
        <div className="nx-cta" data-reveal="">
          <div>
            <span className="nx-eyebrow">ASTS</span>
            <h2 className="nx-h2">Ready To Begin?</h2>
            <p>Find Subjects You're Passionate About By Browsing Our Online Course Categories. Start Learning With Top Courses Built With Industry Experts</p>
          </div>
          <div className="nx-cta-actions">
            <Link to="/student-registration/" className="nx-btn nx-btn-light">
              <Icon name="graduation" /> Student Registration
            </Link>
            <Link to="/faculty-registration/" className="nx-btn nx-btn-ghost-light">
              <Icon name="teacher" /> Faculty Registration
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function News() {
  // No blog posts are published on the site (the live homepage grid is empty too),
  // so this section shows its heading and an empty-state panel instead of invented posts.
  return (
    <section className="nx-section nx-section-alt nx-news">
      <div className="nx-container">
        <SectionHead eyebrow="NEWS UPDATE" title={<>Latest News &amp; Events</>} center />
        <div className="nx-news-empty" data-reveal="">
          <div className="nx-news-icon">
            <Icon name="newspaper" />
          </div>
          <p>No news or events have been published yet.</p>
        </div>
      </div>
    </section>
  );
}

export default function NewHome() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <div className="nx" ref={ref}>
      {/* The live site's contact bar is present but hidden; kept hidden here. */}
      <div hidden>
        <ContactBar />
      </div>
      <Hero />
      <Stats />
      <Categories />
      <Training />
      <Trending />
      <About />
      <WhyChoose />
      <Testimonials />
      <Cta />
      <News />
    </div>
  );
}
