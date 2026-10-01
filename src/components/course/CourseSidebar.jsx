import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COURSE_SIDEBAR_CATEGORIES, EXPLORE_MENU, SITE } from '../../data/site';
import { showLpToast } from '../../lib/lpToast';

const REGISTRATION_URL = '/student-registration/';

/**
 * LearnPress 4.4.7 enrol request (single-course.js): wp.apiFetch POST to the
 * WordPress backend. Resolves to the parsed JSON; rejects with the error body
 * (or a fetch error) like wp.apiFetch does.
 */
async function enrollCourse(id) {
  let res;
  try {
    res = await fetch('/wp-json/lp/v1/courses/enroll-course?_locale=user', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json, */*;q=0.1', 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch {
    throw { code: 'fetch_error', message: 'You are probably offline.' };
  }
  let json;
  try {
    json = await res.json();
  } catch {
    throw { code: 'invalid_json', message: 'The response is not a valid JSON response.' };
  }
  if (!res.ok) throw json;
  return json;
}

/**
 * Single-course sidebar: preview image, price, "Start Now" enroll button and the
 * four widgets that appear on every course page of the current site.
 */
export default function CourseSidebar({ course, full }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null); // { status, message } after a successful request
  const navigate = useNavigate();

  // Same flow as LearnPress: the backend decides (guest -> checkout, logged-in -> enrolled)
  // and answers with a message and a redirect.
  const onEnroll = async (e) => {
    e.preventDefault();
    const id = e.currentTarget.querySelector('input[name=enroll-course]').value;
    setLoading(true);
    try {
      const { status, data: { redirect } = {}, message } = await enrollCourse(id);
      if (status !== 'success') {
        setLoading(false);
        throw new Error(message);
      }
      setDone({ status, message }); // LearnPress removes the button on success
      if (message && status && redirect) window.location.href = redirect;
    } catch (err) {
      setLoading(false);
      showLpToast(err && err.message);
    }
  };

  return (
    <aside className="course-summary-sidebar">
      <div className="course-summary-sidebar__inner">
        <div className="course-sidebar-top">
          <div className="course-sidebar-preview">
            <div className="media-preview">
              <img src={course.preview} alt={course.previewAlt || course.title} />
            </div>
            {course.price ? (
              <div className="course-price">
                <span className="course-item-price">
                  <span className="free">{course.price}</span>
                </span>
              </div>
            ) : null}
            <div className="lp-course-buttons">
              {course.local ? (
                // Not a LearnPress course: WordPress cannot enrol in it, so the button opens the registration
                // form (a real <button>, which is what the LearnPress sidebar styles; works without JS too).
                <form
                  name="enroll-course"
                  className="enroll-course"
                  method="get"
                  action={REGISTRATION_URL}
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate(REGISTRATION_URL);
                  }}
                >
                  <button type="submit" className="lp-button button-enroll-course">
                    {full.enrollBtn}
                  </button>
                </form>
              ) : (
                <form name="enroll-course" className="enroll-course" method="post" onSubmit={onEnroll}>
                  <input type="hidden" name="enroll-course" value={course.id} />
                  {done ? null : (
                    <button type="submit" className={'lp-button button-enroll-course' + (loading ? ' loading' : '')}>
                      {full.enrollBtn || 'Start Now'}
                    </button>
                  )}
                  {done && done.message ? <div className={'learn-press-message ' + done.status} dangerouslySetInnerHTML={{ __html: done.message }} /> : null}
                </form>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}></div>
            </div>
          </div>
        </div>
        <div className="course-sidebar-secondary">
          <div id="text-8" className="widget widget_text">
            <h3 className="widget-title">Course Categories</h3>
            <div className="textwidget">
              <ul>
                {COURSE_SIDEBAR_CATEGORIES.map((c) => (
                  <li key={c.url} className={c.cls}>
                    <Link to={c.url}>{c.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div id="text-6" className="widget widget_text">
            <h3 className="widget-title">Contact Us</h3>
            <div className="textwidget">
              <ul>
                <li>
                  <i className="fa fa-map-marker"></i>ASTS Training
                  <br />
                  Hyderabad-500090.{' '}
                </li>
                <li>
                  <i className="fa fa-phone"></i>: {SITE.phone}{' '}
                </li>
                <li>
                  <i className="fa fa-envelope-o"></i> {SITE.emailLower}{' '}
                </li>
              </ul>
            </div>
          </div>
          <div id="nav_menu-4" className="widget widget_nav_menu">
            <h3 className="widget-title">EXPLORE</h3>
            <div className="menu-footer-pages-container">
              <ul id="menu-footer-pages" className="menu">
                {EXPLORE_MENU.map((m) => (
                  <li key={m.id} id={'menu-item-' + m.id} className={'menu-item menu-item-type-post_type menu-item-object-page ' + (m.cls ? m.cls + ' ' : '') + 'menu-item-' + m.id}>
                    <Link to={m.url}>{m.label}</Link>
                  </li>
                ))}
                <li id="menu-item-5206" className="menu-item menu-item-type- menu-item-object- menu-item-5206">
                  <a></a>
                </li>
              </ul>
            </div>
          </div>
          <div id="contact_widget-3" className="widget widget_contact_widget">
            <h3 className="widget-title">ADDRESS</h3>
            {/* Contact Info Widget */}
            <ul className="fa-ul">
              <li className="address1">
                <i className="glyph-icon educavoicon-location"></i>
                <span>ASTS Training, Hyderabad-500090.</span>
              </li>
              <li>
                <i className="glyph-icon educavoicon-call"></i>
                <a href="tel:Call:+91-8688842717">Call : +91- 868 884 2717</a>
              </li>
              <li>
                <i className="glyph-icon educavoicon-email"></i>
                <a href="mailto:contact@aststraining.com">contact@aststraining.com</a>
              </li>
              <li>
                <i className="fa fa-whatsapp"></i>+91- 868 884 2717
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
