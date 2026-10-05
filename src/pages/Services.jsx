import React from 'react';
import Seo from '../components/Seo';
import { EColumn, ESection, MainContain, RsButton, RsHeading } from '../components/elementor';
import TrainingServices from '../components/home/TrainingServices';
import TrendingCourses from '../components/home/TrendingCourses';
import LatestNews, { SERVICES_NEWS_IDS } from '../components/home/LatestNews';
import PageCss from '../components/PageCss';
import { SERVICES_PAGE_CARDS } from '../data/site';
import pagesSeo from '../data/pages-seo.json';
import pageCss from '../styles/elementor/post-150.css?url';

/** Services page (Elementor page 150 on the current site). */
export default function Services() {
  return (
    <>
      <Seo seo={pagesSeo['/services/']} />
      <PageCss href={pageCss} />
      {/* End Header Menu End */}
      <MainContain article={{ id: 150 }}>
        <div data-elementor-type="wp-page" data-elementor-id="150" className="elementor elementor-150">
          <ESection id="5fd3ec3" extra="elementor-section-stretched elementor-section-full_width">
            <EColumn id="a0cb044" col={100}>
              <ESection id="93dfcb3" inner extra="elementor-section-boxed" animation="fadeInUp" gap="extended">
                <TrainingServices cards={SERVICES_PAGE_CARDS} />
              </ESection>
            </EColumn>
          </ESection>
          <ESection id="2d0dd94" extra="elementor-section-full_width elementor-section-stretched">
            <EColumn id="55fb9d0" col={100}>
              <ESection id="f7919f1" inner extra="elementor-section-content-middle elementor-section-boxed" animation="fadeInUp">
                <EColumn id="c18b38c" col={50} inner>
                  <RsHeading id="3a596e1" align="left" subText="TOP COURSES" watermark="Trending" title="Trending Courses" />
                </EColumn>
                <EColumn id="0efeb1e" col={50} inner>
                  <RsButton id="bc2af31" to="/courses/" text="VIEW ALL COURSES" />
                </EColumn>
              </ESection>
              <ESection id="a4e3c62" inner extra="elementor-section-content-middle elementor-section-boxed" animation="fadeInUp">
                <EColumn id="488df6a" col={100} inner>
                  <TrendingCourses id="1b06da8" count={6} variant="services" />
                </EColumn>
              </ESection>
            </EColumn>
          </ESection>
          <LatestNews ids={SERVICES_NEWS_IDS} />
        </div>
      </MainContain>
      {/* .main-container */}
    </>
  );
}
