import React from 'react';
import Seo from '../components/Seo';
import { EColumn, EHeading, ESection, ETextEditor, MainContain, RsImageHover } from '../components/elementor';
import PageCss from '../components/PageCss';
import pagesSeo from '../data/pages-seo.json';
import css152 from '../styles/elementor/post-152.css?url';
import css154 from '../styles/elementor/post-154.css?url';
import css156 from '../styles/elementor/post-156.css?url';
import css2271 from '../styles/elementor/post-2271.css?url';

const PAGE_CSS = { 'online-training': css152, 'corporate-training': css154, 'project-support': css156, 'idea-discussion': css2271 };

/* Exact content and Elementor ids of the four service detail pages on the current site. */
const PAGES = {
  'online-training': {
    postId: 152,
    ids: { section: '23bb176', column: '7db21bb', inner: '399daac', left: '5e9ca2f', heading: 'd8e89ed', text: '5911d8a', right: '18cd82a', image: '1d42a37', bottom: '3870a90' },
    title: 'Online Training',
    html:
      '<p>Online Training gives comprehensive training from our expert instructors using seamless over the web-connectivity. It delivers the same high-quality content, course work, and experience as our physical classroom training. This kind of training methodology is considered a boon for working professionals.</p><ul class="list-style"><li>Train from wherever you choose.</li><li>Attend the sessions from home at your flexible timings.</li><li>Provides e-learning and online training for everyone around the world.</li><li>We conduct individual or one-to-one online programs.</li><li>Training at ASTS focuses solely on your needs.</li><li>Offers interview oriented training.</li><li>The fee Structure at ASTS varies from course to course. Your valuable money is worth investing at ASTS.</li></ul>',
    image: { src: '/wp-content/uploads/2020/12/about2orange.png', width: 683, height: 529, cls: 'attachment-full size-full wp-image-1972' },
    bottom: 'Get Trained Without Traveling',
  },
  'corporate-training': {
    postId: 154,
    ids: { section: '51fd0b5', column: '386d41e', inner: '30b5bab', left: 'ad9b674', heading: '8fb4722', text: 'dcdf65f', right: '0dc0c4b', image: '582cf91', bottom: '99c4919' },
    title: 'Classroom Training',
    html:
      '<p>Classroom Training gives you a hands-on interactive experience on any technology you choose. It has been the foundation for employee and client education for years. Many participants learn the best and have the greatest opportunity for retention when they learn from a live instructor in a classroom setting.</p><ul class="list-style"><li>ASTS comprise expert instructors.</li><li>Educates with real-time examples.</li><li>Provides the best hands-on experience.</li><li>The fee Structure at ASTS varies from course to course. Your valuable money is worth investing in at ASTS.</li></ul>',
    image: { src: '/wp-content/uploads/2020/12/Classroom-Training.jpg', width: 1114, height: 742, cls: 'attachment-full size-full wp-image-2260' },
    bottom: 'Come, join hands with the US',
  },
  'project-support': {
    postId: 156,
    ids: { section: '51daa25', column: '0127429', inner: 'c4e7472', left: '63481f4', heading: '142a156', text: '5a90725', right: '39a8cee', image: '4ddad05', bottom: 'fc740b1' },
    title: 'Project Support',
    html:
      '<p>Every project is different and therefore the duties of an employee will change accordingly. Project Support deals with independent strategic advice on project delivery.</p><p>ASTS offers a full range of services and assistance to follow step-by-step procedures to complete a project on time.</p>',
    image: { src: '/wp-content/uploads/2020/12/Project-Support.jpg', width: 1114, height: 742, cls: 'attachment-full size-full wp-image-2264' },
    bottom: 'Come, join hands with the US',
  },
  'idea-discussion': {
    postId: 2271,
    ids: { section: '46d46a9', column: '3dd4674', inner: 'ee69532', left: '2a77c1f', heading: 'a532c0c', text: 'aa2e5c4', right: 'a398315', image: 'af49674', bottom: 'ce360d8' },
    title: 'Idea Discussion',
    html:
      '<p>Lorem Ipsum is simply a dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p><ul class="list-style"><li>ASTS comprise expert instructors.</li><li>Educates with real-time examples.</li><li>Provides the best hands-on experience.</li><li>The fee Structure at ASTS varies from course to course. Your valuable money is worth investing in at ASTS.</li></ul>',
    image: { src: '/wp-content/uploads/2020/12/Classroom-Training.jpg', width: 1114, height: 742, cls: 'attachment-full size-full wp-image-2260' },
    bottom: 'Come, join hands with the US',
  },
};

/** Online Training / Corporate Training / Project Support / Idea Discussion pages. */
export default function ServiceDetail({ slug }) {
  const p = PAGES[slug];
  const { ids } = p;
  return (
    <>
      <Seo seo={pagesSeo['/' + slug + '/']} />
      <PageCss href={PAGE_CSS[slug]} />
      {/* End Header Menu End */}
      <MainContain article={{ id: p.postId }}>
        <div data-elementor-type="wp-page" data-elementor-id={p.postId} className={'elementor elementor-' + p.postId}>
          <ESection id={ids.section} extra="elementor-section-boxed">
            <EColumn id={ids.column} col={100}>
              <ESection id={ids.inner} inner extra="elementor-section-content-middle elementor-section-full_width">
                <EColumn id={ids.left} col={50} inner>
                  <EHeading id={ids.heading} text={p.title} />
                  <ETextEditor id={ids.text} html={p.html} />
                </EColumn>
                <EColumn id={ids.right} col={50} inner>
                  <RsImageHover id={ids.image} src={p.image.src} width={p.image.width} height={p.image.height} imgClass={p.image.cls} fetchPriority="high" />
                </EColumn>
              </ESection>
              <EHeading id={ids.bottom} text={p.bottom} />
            </EColumn>
          </ESection>
        </div>
      </MainContain>
      {/* .main-container */}
    </>
  );
}
