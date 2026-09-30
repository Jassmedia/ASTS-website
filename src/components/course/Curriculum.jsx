import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/** Splits "1 Section 10 Lessons 10 Weeks" into its parts (as captured from the current site). */
function parseInfo(info) {
  const tokens = (info || '').match(/\d+\s+[A-Za-z]+/g) || [];
  const duration = tokens.length ? tokens[tokens.length - 1] : '';
  const counts = tokens.slice(0, -1);
  return { counts, duration };
}

/**
 * LearnPress course curriculum (sections + lessons/quizzes) with the same
 * collapse/expand behaviour as the current site. `currentUrl` marks the item
 * being viewed (course item pages) and expands its section.
 */
export default function Curriculum({ course, currentUrl }) {
  const initial = () => {
    const state = {};
    course.sections.forEach((s) => {
      const holdsCurrent = currentUrl && s.items.some((i) => i.url === currentUrl);
      state[s.id] = holdsCurrent ? false : !!s.collapsed;
    });
    return state;
  };
  const [collapsed, setCollapsed] = useState(initial);
  const allExpanded = course.sections.every((s) => !collapsed[s.id]);
  const toggle = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  const setAll = (value) => setCollapsed(Object.fromEntries(course.sections.map((s) => [s.id, value])));
  const { counts, duration } = parseInfo(course.curriculumInfo);

  return (
    <div className="lp-course-curriculum">
      <h3 className="lp-course-curriculum__title">Curriculum</h3>
      <div className="course-curriculum-info">
        <ul className="course-curriculum-info__left">
          {counts.map((c, i) => (
            <li key={i} className={i === 0 ? 'course-count-section' : /Quiz/i.test(c) ? 'course-count-quiz' : 'course-count-lesson'}>
              {c}
            </li>
          ))}
          <li className="course-duration">
            <span className="course-duration">{duration}</span>
          </li>
        </ul>
        <div className="course-curriculum-info__right">
          <span className={'course-toggle-all-sections' + (allExpanded ? ' lp-hidden' : '')} onClick={() => setAll(false)}>
            Expand all sections
          </span>
          <span className={'course-toggle-all-sections lp-collapse' + (allExpanded ? '' : ' lp-hidden')} onClick={() => setAll(true)}>
            Collapse all sections
          </span>
        </div>
      </div>
      <div className="course-curriculum">
        <ul className="course-sections">
          {course.sections.map((s) => (
            <li key={s.id} className={'course-section ' + (collapsed[s.id] ? 'lp-collapse' : '')} data-section-id={s.id}>
              <div className="course-section-header" onClick={() => toggle(s.id)}>
                <div className="section-toggle">
                  <i className="lp-icon-angle-down"></i>
                  <i className="lp-icon-angle-up"></i>
                </div>
                <div className="course-section-info">
                  <div className="course-section__title"> {s.title}</div>
                </div>
                <div className="section-count-items">{s.count}</div>
              </div>
              <ul className="course-section__items">
                {s.items.map((it) => (
                  <li key={it.id} className={'course-item ' + (currentUrl === it.url ? 'current' : '')} data-item-id={it.id} data-item-order={it.order} data-item-type={it.type}>
                    <Link to={it.url} className="course-item__link">
                      <div className="course-item__info">
                        <span className={'course-item-ico ' + it.type}></span>
                        <span className="course-item-order lp-hidden">{it.number}</span>
                      </div>
                      <div className="course-item__content">
                        <div className="course-item__left">
                          <div className="course-item-title">{it.title}</div>
                        </div>
                      </div>
                      <div className="course-item__status">
                        <span className={'course-item-ico ' + it.status}></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
