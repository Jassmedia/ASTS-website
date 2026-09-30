import React from 'react';
import { EColumn, ESection, EWidget } from './elementor';
import { SITE } from '../data/site';
import { withWhitespace } from '../lib/jsx';

const ICONS = [
  ['https://www.facebook.com/aststrainingonline/', 'fab fa-facebook-f'],
  ['https://twitter.com/AstsTraining ', 'fa fa-twitter'],
  ['https://in.pinterest.com/aststrainingonline/ ', 'fa fa-pinterest-p'],
  ['https://in.linkedin.com/company/aststraining ', 'fa fa-linkedin'],
  ['https://www.instagram.com/aststrainingonline?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw== ', 'fa fa-instagram'],
  ['https://www.youtube.com/channel/UCUNAFNnfgjtCmPPfKr0b02g ', 'fa fa-youtube'],
];

function SocialItems({ icons }) {
  return withWhitespace(
    icons.map(([href, icon]) => (
      <li key={icon}>
        {' '}
        <a href={href} target="_blank" rel="noreferrer">
          <span>
            <i className={icon}></i>
          </span>
        </a>{' '}
      </li>
    )),
  );
}

/**
 * The `ul.footer_social` icon list used by the homepage contact bar and by the
 * courses/category sidebar widget (identical markup on the current site,
 * including the trailing spaces inside the hrefs).
 */
export function SocialList() {
  return (
    <ul className="footer_social">
      <SocialItems icons={ICONS} />
    </ul>
  );
}

/** Archive sidebar variant (no Instagram entry on the current site). */
export function SocialListArchive() {
  return (
    <ul className="footer_social">
      <SocialItems icons={ICONS.filter(([, i]) => i !== 'fa fa-instagram')} />
    </ul>
  );
}

/**
 * Homepage contact bar (email / phone / social icons). It exists in the current
 * site's markup but is hidden by the site's custom CSS; kept for parity.
 */
export default function ContactBar() {
  return (
    <ESection id="a7bb8cf" extra="elementor-section-stretched contact-bar elementor-section-boxed">
      <EColumn id="42f36cc" col={33}>
        <EWidget id="0251ba6" type="rs-service-grid">
          <div className="rs-addon-services services-style1">
            <div className="services-part image_left">
              <div className="services-icons">
                <div className="services-icon">
                  <i className="fa fa fa-envelope-o"></i>
                </div>
              </div>
              <div className="services-text">
                <p className="services-txt">  {SITE.altEmail}</p>
              </div>
            </div>
          </div>
        </EWidget>
      </EColumn>
      <EColumn id="1f0114d" col={33} extra="hm-contact-bar">
        <EWidget id="0d9c057" type="rs-service-grid">
          <div className="rs-addon-services services-style1">
            <div className="services-part image_left">
              <div className="services-icons">
                <div className="services-icon">
                  <i className="fa fa fa-instagram"></i>
                </div>
              </div>
              <div className="services-text">
                <p className="services-txt">  {SITE.altPhone}</p>
              </div>
            </div>
          </div>
        </EWidget>
      </EColumn>
      <EColumn id="21f4085" col={33}>
        <EWidget id="1cefd4c" type="wp-widget-medvillsocialiconwi_widget">
          <SocialList />
        </EWidget>
      </EColumn>
    </ESection>
  );
}
