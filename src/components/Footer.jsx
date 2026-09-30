import React from 'react';
import { Link } from 'react-router-dom';
import { SITE, FOOTER_COURSES, FOOTER_SERVICES } from '../data/site';

/** Site footer, reproducing the four widget columns and copyright of the current site. */
export default function Footer() {
  return (
    <footer id="rs-footer" className=" rs-footer footer-style-1 ">
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 footer-0">
              <section id="block-17" className="widget widget_block">
                <details className="wp-block-details">
                  <summary>
                    <img
                      loading="lazy"
                      decoding="async"
                      width="150"
                      height="46"
                      className="wp-image-375 is-layout-flow wp-block-details-is-layout-flow"
                      style={{ width: 150 }}
                      src={SITE.footerLogo}
                      alt=""
                    />
                  </summary>
                </details>
              </section>
              <section id="block-19" className="widget widget_block widget_text">
                <p dangerouslySetInnerHTML={{ __html: SITE.tagline }} />
              </section>
            </div>
            <div className="col-lg-3 footer-1">
              <section id="block-6" className="widget widget_block">
                <h2 className="wp-block-heading has-white-color has-text-color has-link-color wp-elements-5ff84acb1d0df6ded0760a366cc4c7cc">
                  <strong>Address</strong>
                </h2>
              </section>
              <section id="block-7" className="widget widget_block widget_text">
                <p>
                  <strong>Address: </strong>
                  {SITE.address}
                  <br />
                  <strong>Contact </strong>: {SITE.phone}
                  <br />
                  <strong>E-Mail </strong>: {SITE.email}
                </p>
              </section>
            </div>
            <div className="col-lg-3 footer-2">
              <section id="block-8" className="widget widget_block">
                <h2 className="wp-block-heading has-white-color has-text-color has-link-color wp-elements-b25393f1a87b3f9610c33623e3ab8cc7">Courses</h2>
              </section>
              <section id="block-13" className="widget widget_block">
                <ul className="wp-block-list">
                  {FOOTER_COURSES.map((c) => (
                    <li key={c.url}>
                      <Link to={c.url}>{c.label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <div className="col-lg-3 footer-3">
              <section id="block-14" className="widget widget_block">
                <h2 className="wp-block-heading has-white-color has-text-color has-link-color wp-elements-143359b0104e8cad6d40df561741e9dc">Services</h2>
              </section>
              <section id="block-15" className="widget widget_block">
                <ul className="wp-block-list">
                  {FOOTER_SERVICES.map((s) => (
                    <li key={s.url}>
                      <Link to={s.url}>{s.label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="copyright_border">
            <div className="rows">
              <div className="cols">
                <div className="copyright text-center">
                  <p>{SITE.copyright}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
