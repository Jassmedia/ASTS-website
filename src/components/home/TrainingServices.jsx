import React from 'react';
import { Link } from 'react-router-dom';
import { EColumn, EWidget } from '../elementor';

/**
 * "Our Training" cards (RS Elements rs-image-hover-effect widgets), used on the
 * homepage and on the Services page. `cards` carries the Elementor ids of each
 * column/widget so the generated CSS keeps applying.
 */
export default function TrainingServices({ cards }) {
  return (
    <>
      {cards.map((c) => (
        <EColumn key={c.id} id={c.col} col={25} inner>
          <EWidget id={c.id} type="rs-image-hover-effect" extra="our_traning_height">
            <div className="rs-image-hover-effect">
              <div className="animation-effect rs-image-fade">
                <div className="image-part">
                  <img decoding="async" width="101" height="101" src={c.image} className="attachment-thumbnail size-thumbnail" alt={c.alt} />{' '}
                </div>
                <div className="image-content">
                  <div className="title-part">
                    <div className="image-title-part">
                      <h3 className="image-title">
                        {' '}
                        <Link to={c.url}> {c.title}</Link>
                      </h3>
                    </div>
                  </div>
                  <div className="description-part">
                    <div className="description-text"> {c.text} </div>
                  </div>
                </div>
              </div>
            </div>
          </EWidget>
        </EColumn>
      ))}
    </>
  );
}
