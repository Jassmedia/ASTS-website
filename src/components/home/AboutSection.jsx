import React from 'react';
import { EColumn, ESection, EWidget, RsHeading } from '../elementor';
import { COUNTERS } from '../../data/site';

/** Homepage "About Us" block with the tilting image and the four counters. */
export default function AboutSection() {
  return (
    <ESection id="40fee20" extra="elementor-section-stretched elementor-section-boxed">
      <EColumn id="3952abf" col={100}>
        <ESection id="fcb9fb0" inner extra="elementor-section-content-middle elementor-section-full_width" animation="fadeInUp">
          <EColumn id="9a8a08b" col={50} inner>
            <RsHeading id="88bdd7d" title="About Us" />
            <RsHeading
              id="efe197f"
              description={
                <>
                  <p>Amaravathi Soft Tek Sol (ASTS) Is Specially Designed For Online Training.</p>
                  <p>It Allows Freshers And Corporate Employees To Enhance Their Knowledge And Skills To Compete With The Current Industry Standards.</p>
                  <p>ASTS Is Always Determined To Empower Their Trainees To Meet Their Goals.</p>
                  <p>
                    It Provides The Finest Training In Hyperion, SAP, Oracle And In Reporting Tools. Our ASTS Is The Ultimate Destination For Those Who Wish To Deliver Their Optimum
                    Skills To The Organization.
                  </p>
                </>
              }
            />
          </EColumn>
          <EColumn id="d4fcbb6" col={50} inner>
            <EWidget id="4d5aa6e" type="rs-multi-image-hover">
              <div className="rs-multi-rallax elementor-image">
                <img decoding="async" className="rs-multi-image animated rotate infinite" src="/wp-content/uploads/2020/12/dotss.png" alt="image" />
                <div className="image titlt" data-tilt="" data-tilt-max="3">
                  <a>
                    <img loading="lazy" decoding="async" width="683" height="529" src="/wp-content/uploads/2020/12/about2orange.png" className="attachment-full size-full wp-image-1972" alt="" />
                  </a>
                </div>
              </div>
            </EWidget>
          </EColumn>
        </ESection>
        <ESection id="9e1e99b" inner extra="elementor-section-full_width" animation="fadeInUp">
          {COUNTERS.map((c) => (
            <EColumn key={c.id} id={c.col} col={25} inner>
              <EWidget id={c.id} type="rs-counter">
                <div className="counter-top-area style1">
                  <div className="rs-counter-list">
                    <div className="count-text">
                      <div className="count-number">
                        <span className="rs-counter"> {c.value}</span>
                        <span className="prefix">{c.prefix}</span>
                      </div>
                      <span className="title">  {c.title}</span>
                    </div>
                  </div>
                </div>
              </EWidget>
            </EColumn>
          ))}
        </ESection>
      </EColumn>
    </ESection>
  );
}
