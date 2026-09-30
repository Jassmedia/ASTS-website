import React from 'react';
import { EColumn, ESection, EWidget, RsHeading } from '../elementor';

/**
 * "Latest News & Events" section (RS Elements rsblog widget). The current site has
 * no published posts, so the blog grid renders empty there as well.
 */
export default function LatestNews({ ids }) {
  return (
    <ESection id={ids.section} extra="elementor-section-stretched latest_news elementor-section-boxed" animation="fadeInUp">
      <EColumn id={ids.column} col={100}>
        <RsHeading id={ids.heading} align="center" subText="NEWS UPDATE" title={<>Latest News &amp; Events</>} />
        <ESection id={ids.inner} inner extra="elementor-section-full_width">
          <EColumn id={ids.innerColumn} col={100} inner>
            <EWidget id={ids.widget} type="rsblog">
              <div className="rs-blog-grid rs-blog-grid2">
                <div className="row blog-gird-item"></div>
              </div>
            </EWidget>
          </EColumn>
        </ESection>
      </EColumn>
    </ESection>
  );
}

export const HOME_NEWS_IDS = { section: 'a5c7f6f', column: 'c96e04d', heading: 'c7342f5', inner: '68a5e6c', innerColumn: '323547a', widget: '3b0513d' };
export const SERVICES_NEWS_IDS = { section: 'f1e86bf', column: 'b52a52a', heading: '56e8682', inner: 'd4847a6', innerColumn: 'ace84c5', widget: '7b40260' };
