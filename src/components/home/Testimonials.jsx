import React from 'react';
import { EWidget } from '../elementor';
import SlickSlider from '../SlickSlider';
import testimonials from '../../data/testimonials.json';

const SLIDER_CONF =
  '{"slidesToShow":"2","autoplaySpeed":3000,"interval":3000,"slidesToScroll":2,"slider_autoplay":"false","pauseOnHover":"false","sliderDots":"true","sliderNav":"false","infinite":"false","centerMode":"false","col_lg":"2","col_md":"2","col_sm":"1","col_xs":"1"}';

/**
 * Student testimonials slider (RS Elements rs-testimonial-slider widget, style 2).
 * Used on the homepage and on the three registration pages.
 */
export default function Testimonials({ id, sliderId }) {
  return (
    <EWidget id={id} type="rs-testimonial-slider" extra="rs-testimonial--center student_testimonial">
      <div className="rsaddon-unique-slider rs-testimonial-slider2">
        <SlickSlider id={'rsaddon-slick-slider-' + sliderId} className="rs-addon-slider" cols={{ lg: 2, md: 2, sm: 1, xs: 1 }} slidesToScroll={2} dots>
          {testimonials.map((t) => (
            <div key={t.slug} className="testimonial-innner">
              <div className="testi-item">
                <div className="row y-middle no-gutter">
                  <div className="col-lg-4 col-md-3">
                    <div className="user-info">
                      <img loading="lazy" decoding="async" width="120" height="120" src={t.thumb} className="attachment-educavo_testimonial_image size-educavo_testimonial_image wp-post-image" alt="" />{' '}
                    </div>
                  </div>
                  <div className="col-lg-8 col-md-9">
                    <div className="desc">
                      <i className="fa "></i> <p>{t.text}</p>
                      <h4 className="name">{t.name}</h4>
                      <span className="designation"> {t.designation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </SlickSlider>
        <div className="rsaddon-slider-conf wpsisac-hide" data-conf={SLIDER_CONF}></div>
      </div>
    </EWidget>
  );
}
