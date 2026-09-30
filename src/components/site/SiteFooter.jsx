import React from 'react';
import { Link } from 'react-router-dom';
import { SITE, FOOTER_COURSES, FOOTER_SERVICES } from '../../data/site';
import Icon from './Icons';

/** Site footer (redesign): same four columns, headings, links and copyright as before. */
export default function SiteFooter() {
  return (
    <footer className="nx-footer">
      <div className="nx-container nx-footer-top">
        <div className="nx-footer-brand">
          <img loading="lazy" decoding="async" width="150" height="46" src={SITE.footerLogo} alt="" />
          <p dangerouslySetInnerHTML={{ __html: SITE.tagline }} />
        </div>
        <div>
          <h2>Address</h2>
          <ul className="nx-footer-contact">
            <li>
              <Icon name="mapPin" />
              <span>
                <strong>Address</strong>
                {SITE.address}
              </span>
            </li>
            <li>
              <Icon name="phone" />
              <span>
                <strong>Contact</strong>
                {SITE.phone}
              </span>
            </li>
            <li>
              <Icon name="mail" />
              <span>
                <strong>E-Mail</strong>
                {SITE.email}
              </span>
            </li>
          </ul>
        </div>
        <div>
          <h2>Courses</h2>
          <ul className="nx-footer-links">
            {FOOTER_COURSES.map((c) => (
              <li key={c.url}>
                <Link to={c.url}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Services</h2>
          <ul className="nx-footer-links">
            {FOOTER_SERVICES.map((s) => (
              <li key={s.url}>
                <Link to={s.url}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="nx-footer-bottom">
        <div className="nx-container">
          <p>{SITE.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
