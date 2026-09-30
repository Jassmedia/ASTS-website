import React from 'react';
import { EColumn, ESection, EWidget, RsHeading } from '../elementor';
import { WHY_CHOOSE } from '../../data/site';

function ServiceCard({ card }) {
  return (
    <EWidget id={card.id} type="rs-service-grid" animation={card.anim} delay={card.delay}>
      <div className="rs-addon-services services-style1">
        <div className="services-part image_left">
          <div className="services-icons">
            <div className="services-icon">
              <img decoding="async" src={card.image} alt="image" />
              <div className="services-title services-title4">
                <h2 className="title"> {card.title}</h2>
              </div>
            </div>
            <div className="services-title services-title4">
              <h2 className="title"> {card.title}</h2>
            </div>
          </div>
          <div className="services-text">
            <div className="services-title">
              <h2 className="title"> {card.title}</h2>
            </div>
            <p className="services-txt">  {card.text}</p>
          </div>
        </div>
      </div>
    </EWidget>
  );
}

/** Homepage "Why Choose ASTS?" section (seven rs-service-grid cards in two columns). */
export default function WhyChoose() {
  return (
    <ESection id="31555c6" extra="elementor-section-stretched elementor-section-full_width">
      <EColumn id="6854949" col={100}>
        <ESection id="83d869b" inner extra="elementor-section-content-middle elementor-section-boxed" animation="fadeInUp">
          <EColumn id="8fec2ac" col={100} inner>
            <RsHeading id="7b74bee" align="center" title="Why Choose ASTS?" />
          </EColumn>
        </ESection>
        <ESection id="6fe57d3" inner extra="elementor-section-boxed" animation="fadeInUp" gap="extended">
          <EColumn id="74a8926" col={50} inner>
            {WHY_CHOOSE.left.map((c) => (
              <ServiceCard key={c.id} card={c} />
            ))}
          </EColumn>
          <EColumn id="76e24bc" col={50} inner>
            {WHY_CHOOSE.right.map((c) => (
              <ServiceCard key={c.id} card={c} />
            ))}
          </EColumn>
        </ESection>
      </EColumn>
    </ESection>
  );
}
