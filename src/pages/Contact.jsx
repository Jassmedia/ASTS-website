import React from 'react';
import Seo from '../components/Seo';
import { EColumn, ESection, EWidget, MainContain, RsHeading, RsImageHover } from '../components/elementor';
import Cf7Form, { Cf7Input, Cf7Textarea } from '../components/forms/Cf7Form';
import PageCss from '../components/PageCss';
import pagesSeo from '../data/pages-seo.json';
import pageCss from '../styles/elementor/post-11.css?url';

function ContactBox({ id, icon, label, children }) {
  return (
    <EWidget id={id} type="rs-contact-box">
      {/* Style 1 Start */}
      <div className="rs-contact-box">
        <div className="address-item horizontal">
          <div className="address-icon">
            <i className={'fa ' + icon}></i>
          </div>
          <div className="address-text">
            <div className="text">
              <span className="label">{label}</span>
              <span className="des">{children}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Style 1 End */}
    </EWidget>
  );
}

const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7609.993314797067!2d78.385557!3d17.507673!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91f894a1e4bb%3A0xe1620df2fc44b6fd!2sVenkata%20Sai%20Enclave%2C%20Nizampet%20Rd%2C%20Nizampet%2C%20Hyderabad%2C%20Telangana%20500090!5e0!3m2!1sen!2sin!4v1607087709174!5m2!1sen!2sin';

/** Contact page (Elementor page 11): address boxes, Google map, image and the "Get In Touch" form (CF7 form 2213). */
export default function Contact() {
  return (
    <>
      <Seo seo={pagesSeo['/contact/']} />
      <PageCss href={pageCss} />
      {/* End Header Menu End */}
      <MainContain article={{ id: 11 }}>
        <div data-elementor-type="wp-page" data-elementor-id="11" className="elementor elementor-11">
          <ESection id="c8ca8e3" extra="elementor-section-boxed">
            <EColumn id="6a014e9" col={50}>
              <ContactBox id="9d2f8ef" icon="fa-home" label="Company Location">
                Plot No:37, Venkatasai Enclave,
                <br />
                <b>City : </b> Nizampet, Kukatpally
                <br />
                <b>Country : </b> Hyderabad-500090. India
              </ContactBox>
              <ContactBox id="0956fb5" icon="fa-clock-o" label="Working Hours">
                <b>Mon-Fri :</b> 8:00am – 19:00pm
                <br />
                <b>Saturday :</b> 8:00am – 13:00pm
                <br />
                <b>Sunday :</b> Closed
              </ContactBox>
              <ContactBox id="07d2752" icon="fa-phone" label="Contact Us!">
                Available 24/7
                <br />
                <b>Mobile : </b>+91- 86 888 42 717
                <br />
                <b>E-mail : </b>contact@aststraining.com
              </ContactBox>
            </EColumn>
            <EColumn id="5387c1c" col={50}>
              <EWidget id="3f11262" type="html">
                <iframe src={MAP_SRC} width="100%" height="610px" frameBorder="0" style={{ border: 0 }} allowFullScreen="" aria-hidden="false" tabIndex="0" title="ASTS Training location map"></iframe>
              </EWidget>
            </EColumn>
          </ESection>
          <ESection id="1aebb90" extra="elementor-section-content-bottom elementor-section-boxed">
            <EColumn id="6bbbf74" col={50}>
              <RsImageHover id="7e1bef1" src="/wp-content/uploads/2020/12/con2.png" width={413} height={605} imgClass="attachment-large size-large wp-image-2143" alt="Contact ASTS Training" fetchPriority="high" />
            </EColumn>
            <EColumn id="513f375" col={50}>
              <RsHeading
                id="b59538d"
                title="Get In Touch"
                description={
                  <p>
                    <strong>ASTSTRAINING</strong>
                  </p>
                }
              />
              <EWidget id="20463b5" type="rs-cf7" extra="registration-form">
                <div className="form_btn_">
                  <Cf7Form formId={2213} postId={11} pagePath="/contact/" formName="contact">
                    <div className="row">
                      <Cf7Input name="your-name" label="Name" />
                      <Cf7Input name="your-email" label="Email" type="email" />
                      <Cf7Input name="number-415" label="Phone Number" type="number" leadingSpace />
                      <Cf7Input name="Subject" label="Subject" leadingSpace />
                      <Cf7Textarea name="textarea" label="Your message" />
                    </div>
                  </Cf7Form>
                </div>
              </EWidget>
            </EColumn>
          </ESection>
        </div>
      </MainContain>
      {/* .main-container */}
    </>
  );
}
