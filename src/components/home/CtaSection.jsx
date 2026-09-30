import React from 'react';
import { EColumn, ESection, RsButton, RsHeading } from '../elementor';

/** Homepage "Ready To Begin?" call to action with the two registration buttons. */
export default function CtaSection() {
  return (
    <ESection id="31c5411" extra="elementor-section-stretched registrations-btn elementor-section-boxed">
      <EColumn id="859195d" col={100}>
        <RsHeading
          id="a0ce1a2"
          align="center"
          title="Ready To Begin?"
          description={
            <p>
              Find Subjects You're Passionate About By Browsing Our Online Course
              <br />
              Categories. Start Learning With Top Courses Built With Industry <br />
              Experts
            </p>
          }
        />
        <ESection id="489706b" inner extra="elementor-section-boxed">
          <EColumn id="a70acba" col={50} inner>
            <RsButton id="8dfd02e" to="/student-registration/" text="Student Registration" />
          </EColumn>
          <EColumn id="5a05cc3" col={50} inner>
            <RsButton id="e451a20" to="/faculty-registration/" text="Faculty Registration" />
          </EColumn>
        </ESection>
      </EColumn>
    </ESection>
  );
}
