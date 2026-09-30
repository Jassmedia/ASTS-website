import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import pagesSeo from '../data/pages-seo.json';

/** 404 template of the current site (no header/footer, "404 Page Not Found" block). */
export default function NotFound() {
  return (
    <>
      <Seo seo={pagesSeo['/404']} canonical={null} robots="noindex, follow" />
      <div className="page-error">
        <div className="container">
          <div id="content">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <section className="error-404 not-found">
                  <div className="page-content">
                    <h2>
                      <span>404</span>
                      Page Not Found
                    </h2>
                    <Link className="readon" to="/">
                      Back to Homepage
                    </Link>
                  </div>
                  {/* .page-content */}
                </section>
                {/* .error-404 */}
              </main>
              {/* #main */}
            </div>
            {/* #primary */}
          </div>
        </div>
      </div>
      {/* .page-error */}
    </>
  );
}
