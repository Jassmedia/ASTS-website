import React from 'react';
import Seo from '../components/Seo';
import { EColumn, EImage, ESection, EWidget, MainContain, RsHeading } from '../components/elementor';
import Cf7Form, { Cf7Group, Cf7Input, Cf7Select, Cf7Textarea } from '../components/forms/Cf7Form';
import Testimonials from '../components/home/Testimonials';
import PageCss from '../components/PageCss';
import pagesSeo from '../data/pages-seo.json';
import css144 from '../styles/elementor/post-144.css?url';
import css146 from '../styles/elementor/post-146.css?url';
import css148 from '../styles/elementor/post-148.css?url';

const PAGE_CSS = { registration: css144, 'student-registration': css146, 'faculty-registration': css148 };

/* Exact Elementor ids of the three registration pages on the current site. */
const VARIANTS = {
  registration: {
    postId: 144,
    formId: 2140,
    ids: { section: '8b7bb15', column: '7f10d6a', inner: 'c097c0f', imgCol: 'cc1e994', image: '5f21ab4', formCol: 'aead1e4', form: 'c41ec25', tSection: '32832f5', tColumn: '6b9729d', tHeading: 'c41f473', tInner: 'c0617ad', tInnerCol: '751504e', tWidget: '9d839a5', slider: '19778' },
    clearOnHide: false,
  },
  'student-registration': {
    postId: 146,
    formId: 2177,
    ids: { section: '17fd689', column: '630d845', inner: 'f4a2490', imgCol: 'a595f46', image: '8ef0b3b', formCol: '311e823', form: 'ae7f142', tSection: 'dc3a35d', tColumn: '66ac964', tHeading: '7a8ea78', tInner: 'ae5f736', tInnerCol: 'b6d46cc', tWidget: '4eaff2a', slider: '2592' },
    clearOnHide: true,
  },
  'faculty-registration': {
    postId: 148,
    formId: 2178,
    ids: { section: 'a3a0761', column: 'e416b7a', inner: '319f94e', imgCol: '1df9c79', image: 'ba6c572', formCol: '5525c3e', form: '186ed7e', tSection: '4d84366', tColumn: '5f0b3ce', tHeading: '1ffa921', tInner: 'd801c73', tInnerCol: 'ebc2ae5', tWidget: '577a18c', slider: '20212' },
    clearOnHide: false,
  },
};

const COURSES = ['Select Courses', 'Hyperion', 'Datascience & ML', 'ERP', 'ETL Tools', 'BI', 'Website Development', 'Testing', 'Programming', 'Business Intelligence Tools', 'Cloud Computing', 'Bigdata', 'Trending Technologies', 'Digital Marketing', 'BigData'];

/* Conditional sub-course groups: [group id, "Select Courses" value, field name, label, options] */
const GROUPS = [
  ['Hyperion-sub-course', 'Hyperion', 'HypersionCourses', 'Select Sub Hyperion Course', ['ARCS', 'DRM', 'DRM/DRG Online Training', 'Essbase', 'FDMEE', 'FDMEE Online Training', 'HFM', 'HFM Online Training', 'HPCM Online Training', 'HSF Online Training', 'Hyperion Essbase Online Training', 'Hyperion Planning Online Training', 'ODI', 'ODI Online Training', 'PBCS', 'Planning']],
  ['Datascience-ML-sub-course', 'Datascience & ML', 'DatascienceML', 'Select Sub Datascience & ML Course', ['ABAP', 'BASIS', 'BO', 'BPC', 'CRM', 'Deep Learning', 'FICO', 'HANA', 'R', 'SAP ABAP Online Training', 'SAP BI BW Online Training', 'SAP BO Online Training', 'SAP BPC Online Training', 'SAP CRM Online Training', 'SAP FICO Online Training', 'SAP HANA Online Training', 'SAP MM Online Training', 'SAP Simple Finance Online Training', 'SAS', 'SRM', 'Statistical Modelling']],
  ['ERP-sub-course', 'ERP', 'ERP', 'Select Sub ERP Course', ['Apps DBA', 'Apps Func Financials', 'Apps Func SCM', 'Apps Technical', 'MS Dynamics', 'Workday Financials']],
  ['ETLTools', 'ETL Tools', 'ETLTools', 'Select Sub ETL Tools Course', ['Abinitio', 'DataStage', 'INFORMATICA', 'MSBI', 'Mulesoft', 'TeraData']],
  ['BI', 'BI', 'BI', 'Select Sub BI Course', ['Cognos', 'Cognos Planning', 'JasperSoft', 'OBIEE', 'QLIKVIEW', 'Tableau']],
  ['WebsiteDevelopment', 'Website Development', 'WebsiteDevelopment', 'Select Sub Website Development Course', ['AngularJS Online Training', 'HTML and Jquery Online Training', 'UI Online Training', ['Wordpress Online Training', 'WordPress Online Training']]],
  ['Testing', 'Testing', 'Testing', 'Select Sub Testing Course', ['ETL Testing Online Training', 'Hadoop Testing Online Training', 'Selenium Online Training']],
  ['Programming', 'Programming', 'Programming', 'Select Sub Programming Course', ['Fullstack', 'Python Online Training', 'Ruby on Rails Online Training']],
  ['BusinessIntelligenceTools', 'Business Intelligence Tools', 'BusinessIntelligenceTools', 'Select Sub Business Intelligence Tools Course', ['Cognos BI Online Training', 'Cognos TM1 Online Training', 'Informatica Online Training', 'Jaspersoft Online Training', 'MSBI Online Training', 'OBIEE Online Training', 'Pentaho Online Training', 'QlikView Online Training', 'Tableau Online Training', 'Talend Online Training', 'TIBCO Spotfire Online Training']],
  ['CloudComputing', 'Cloud Computing', 'CloudComputing', 'Select Sub Cloud Computing Course', ['Anaplan', 'AWS', 'Microsoft Azure', 'Salesforce CRM', 'SalesForce Online Training', 'Workday Online Training']],
  ['Bigdata', 'Bigdata', 'Bigdata', 'Select Sub Bigdata Course', ['DevOps Online Training', 'Hadoop', 'Hive', 'Kafka', 'Spark']],
  ['TrendingTechnologies', 'Trending Technologies', 'TrendingTechnologies', 'Select Sub Trending Technologies Course', ['Cassandra Online Training', 'CouchBase Online Training', 'Hbase Online Training', 'Mongo DB Online Training', 'NOSQL Online Training']],
  ['DigitalMarketing', 'Digital Marketing', 'DigitalMarketing', 'Select Sub Digital Marketing Course', ['SEM Online Training', 'SEO Online Training', 'SMM Online Training']],
  ['BigData', 'BigData', 'BigData', 'Select Sub BigData Course', ['Bigdata Hadoop Online Training', 'Data Analytics Online Training', 'Data Science Online Training', 'Hadoop', 'Hadoop Administration Online Training']],
];

/** The registration form fields (identical on the three registration pages of the current site). */
export function RegistrationFields({ clearOnHide }) {
  return (
    <div className="row">
      <Cf7Input name="your-name" label="Name" />
      <Cf7Input name="your-email" label="Email" type="email" />
      <Cf7Input name="number-415" label="Phone Number" type="number" leadingSpace />
      <Cf7Select name="SelectCourses" label="Select Courses" options={COURSES} />
      <div className="col-lg-12 col-md-12">
        {GROUPS.map(([id, when, name, label, options]) => (
          <Cf7Group key={id} id={id} field="SelectCourses" value={when} clearOnHide={clearOnHide}>
            <Cf7Select name={name} label={label} options={options} wrapInCol={false} />
          </Cf7Group>
        ))}
      </div>
      <Cf7Input name="Country" label="Country" col="col-lg-12 col-md-12" leadingSpace />
      <Cf7Textarea name="your-message" label="Your message (optional)" required={false} />
    </div>
  );
}

/** Registration / Student Registration / Faculty Registration pages (Elementor pages 144 / 146 / 148). */
export default function RegistrationPage({ variant }) {
  const v = VARIANTS[variant];
  const { ids } = v;
  const path = '/' + variant + '/';
  return (
    <>
      <Seo seo={pagesSeo[path]} />
      <PageCss href={PAGE_CSS[variant]} />
      {/* End Header Menu End */}
      <MainContain article={{ id: v.postId }}>
        <div data-elementor-type="wp-page" data-elementor-id={v.postId} className={'elementor elementor-' + v.postId}>
          <ESection id={ids.section} extra="elementor-section-full_width elementor-section-stretched">
            <EColumn id={ids.column} col={100}>
              <ESection id={ids.inner} inner extra="elementor-section-boxed">
                <EColumn id={ids.imgCol} col={50} inner>
                  <EImage id={ids.image} src="/wp-content/uploads/2020/12/con2.png" width={413} height={605} className="attachment-large size-large wp-image-2143" fetchPriority="high" />
                </EColumn>
                <EColumn id={ids.formCol} col={50} inner>
                  <EWidget id={ids.form} type="rs-cf7" extra="registration-form">
                    <div className="form_btn_">
                      <Cf7Form formId={v.formId} postId={v.postId} pagePath={path} formName={variant}>
                        <RegistrationFields clearOnHide={v.clearOnHide} />
                      </Cf7Form>
                    </div>
                  </EWidget>
                </EColumn>
              </ESection>
            </EColumn>
          </ESection>
          <ESection id={ids.tSection} extra="elementor-section-stretched elementor-section-boxed">
            <EColumn id={ids.tColumn} col={100}>
              <RsHeading id={ids.tHeading} align="center" subText="WHAT OUR STUDENTS" title="Clients have to say about ASTS" />
              <ESection id={ids.tInner} inner extra="elementor-section-full_width">
                <EColumn id={ids.tInnerCol} col={100} inner>
                  <Testimonials id={ids.tWidget} sliderId={ids.slider} />
                </EColumn>
              </ESection>
            </EColumn>
          </ESection>
        </div>
      </MainContain>
      {/* .main-container */}
    </>
  );
}
