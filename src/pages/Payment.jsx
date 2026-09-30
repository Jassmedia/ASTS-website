import React from 'react';
import Seo from '../components/Seo';
import { EColumn, EHeading, EImage, ESection, ETextEditor, MainContain } from '../components/elementor';
import PageCss from '../components/PageCss';
import pagesSeo from '../data/pages-seo.json';
import pageCss from '../styles/elementor/post-158.css?url';

const ROWS = [
  {
    section: 'b6da7fe',
    left: '2dec330a',
    heading: 'f771674',
    text: 'ad12b8e',
    right: '75e2aff',
    image: '1535796',
    title: 'Payment Mode',
    html: '<p>ASTS offers safe and secure payment options to Students and Trainees</p><p>Transfer using NEFT/IMPS from any Nationalized/Private bank directly into ASTS Account</p>',
    img: { src: '/wp-content/uploads/2020/12/NEFT-RTGS-and-IMPS.jpg', cls: 'attachment-large size-large wp-image-2296', priority: 'high' },
  },
  {
    section: 'f64c2a2',
    left: '1677853',
    heading: '557b036',
    text: '0ec7749',
    right: '0d92f0a',
    image: 'e0cb05c',
    title: 'Paytm',
    html: '<p>Use a PAYTM account to transfer money in a simple and safe manner for any course selected.</p><p>All you need is the PAYTM App installed on your device and ASTS Mobile number to which funds need to be transferred</p>',
    img: { src: '/wp-content/uploads/2020/12/paytm.jpg', cls: 'attachment-large size-large wp-image-2304' },
  },
  {
    section: '13893bd',
    left: '0237e3e',
    heading: '2fa13cf',
    text: 'f79a6fb',
    right: '12adf46',
    image: 'b81838e',
    title: 'Others',
    html: '<p>We are striving to add more payment options in future to make it easy for everyone .</p><p>We will keep you updated on this front</p>',
    img: { src: '/wp-content/uploads/2020/12/others.jpg', cls: 'attachment-large size-large wp-image-2324' },
  },
];

/** Payment page (Elementor page 158 on the current site). */
export default function Payment() {
  return (
    <>
      <Seo seo={pagesSeo['/payment/']} />
      <PageCss href={pageCss} />
      {/* End Header Menu End */}
      <MainContain article={{ id: 158 }}>
        <div data-elementor-type="wp-page" data-elementor-id="158" className="elementor elementor-158">
          {ROWS.map((r) => (
            <ESection key={r.section} id={r.section} extra="elementor-section-content-top elementor-section-boxed">
              <EColumn id={r.left} col={50}>
                <EHeading id={r.heading} text={r.title} />
                <ETextEditor id={r.text} html={r.html} />
              </EColumn>
              <EColumn id={r.right} col={50}>
                <EImage id={r.image} src={r.img.src} width={640} height={168} className={r.img.cls} fetchPriority={r.img.priority} />
              </EColumn>
            </ESection>
          ))}
        </div>
      </MainContain>
      {/* .main-container */}
    </>
  );
}
