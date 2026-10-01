import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../site/Icons';
import { SITE } from '../../data/site';

const REGISTRATION_URL = '/student-registration/';

/**
 * "Register for this course" box at the end of every course's Overview tab: the student
 * registration form, plus call / WhatsApp / email with the course name filled in.
 */
export default function CourseRegister({ course }) {
  const digits = SITE.phone.replace(/\D/g, '');
  const whatsapp = `https://wa.me/${digits}?text=${encodeURIComponent(`Hi, I would like to register for ${course.title}.`)}`;
  const mail = `mailto:${SITE.emailLower}?subject=${encodeURIComponent(`Registration: ${course.title}`)}`;
  return (
    <section className="nx-course-register" aria-labelledby="course-register-title">
      <div className="nx-course-register-icon">
        <Icon name="graduation" />
      </div>
      <div>
        <h3 id="course-register-title">Register for {course.title}</h3>
        <p>Fill in the student registration form, or call, WhatsApp or email us, and our team will get in touch with you about the course.</p>
        <div className="nx-course-register-actions">
          <Link to={REGISTRATION_URL} className="nx-course-register-btn">
            Register Now <Icon name="arrowRight" />
          </Link>
          <a href={`tel:+${digits}`}>
            <Icon name="phone" /> {SITE.phone}
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            <i className="fa fa-whatsapp" aria-hidden="true"></i> WhatsApp
          </a>
          <a href={mail}>
            <Icon name="mail" /> {SITE.emailLower}
          </a>
        </div>
      </div>
    </section>
  );
}
