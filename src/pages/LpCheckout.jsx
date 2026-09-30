import React from 'react';
import Seo from '../components/Seo';
import { LpBreadcrumb, LpStyles } from '../components/learnpress';
import pagesSeo from '../data/pages-seo.json';

/** LearnPress checkout page (/lp-checkout/) as shown to visitors: the cart is always empty. */
export default function LpCheckout() {
  return (
    <>
      <Seo seo={pagesSeo['/lp-checkout/']} />
      <LpStyles />
      {/* End Header Menu End */}
      <div className="main-contain offcontents">
        <div className="lp-archive-courses">
          <LpBreadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'Lp Checkout', url: '/lp-checkout/' },
            ]}
          />
          <h1 className="lp-content-area">Lp Checkout</h1>
          <div className="learnpress">
            <div id="learn-press-checkout" className="lp-content-area">
              <div className="learn-press-message error"> Your cart is currently empty.</div>
            </div>
          </div>
        </div>
      </div>
      {/* .main-container */}
    </>
  );
}
