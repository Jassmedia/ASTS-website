import React from 'react';
import { Link } from 'react-router-dom';
import { cleanHtml } from '../lib/html';

/* Small wrappers that print the exact Elementor markup/classes used by the current site,
   so the ported Elementor + theme CSS applies unchanged. */

export function ESection({ id, inner = false, extra = '', animation, children, gap = 'default' }) {
  const cls = [
    'elementor-section',
    inner ? 'elementor-inner-section' : 'elementor-top-section',
    'elementor-element',
    'elementor-element-' + id,
    extra,
    'elementor-section-height-default elementor-section-height-default',
    animation ? 'elementor-invisible' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section className={cls} data-id={id} data-element_type="section" data-e-type="section" data-animation={animation || undefined}>
      <div className={'elementor-container elementor-column-gap-' + gap}>{children}</div>
    </section>
  );
}

export function EColumn({ id, col = 100, inner = false, extra = '', children }) {
  const cls = ['elementor-column', 'elementor-col-' + col, inner ? 'elementor-inner-column' : 'elementor-top-column', 'elementor-element', 'elementor-element-' + id, extra]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} data-id={id} data-element_type="column" data-e-type="column">
      <div className="elementor-widget-wrap elementor-element-populated">{children}</div>
    </div>
  );
}

export function EWidget({ id, type, extra = '', animation, delay, children }) {
  const cls = ['elementor-element', 'elementor-element-' + id, extra, animation ? 'elementor-invisible' : '', 'elementor-widget', 'elementor-widget-' + type].filter(Boolean).join(' ');
  return (
    <div
      className={cls}
      data-id={id}
      data-element_type="widget"
      data-e-type="widget"
      data-widget_type={type + '.default'}
      data-animation={animation || undefined}
      data-animation-delay={delay || undefined}
    >
      <div className="elementor-widget-container">{children}</div>
    </div>
  );
}

/** RS Elements "rs-heading" widget (section titles). */
export function RsHeading({ id, align = '', subText, title, watermark = '', description, extra = '' }) {
  return (
    <EWidget id={id} type="rs-heading" extra={extra}>
      <div className={'rs-heading default ' + align}>
        <div className="title-inner">
          {subText ? <span className="sub-text ">{subText}</span> : null}
          {title !== undefined ? (
            <h2 className="title">
              <span className="watermark">{watermark}</span>
              {title}
            </h2>
          ) : null}
        </div>
        {description ? <div className="description">{description}</div> : null}
      </div>
    </EWidget>
  );
}

/** RS Elements "rs-button" widget. */
export function RsButton({ id, to, href, text }) {
  const inner = (
    <span className="rs_btn__text">
      <span className="btn_text">{text}</span>
    </span>
  );
  return (
    <EWidget id={id} type="rs-button">
      <div className="rs-view-btn">
        {to ? (
          <Link className="rs-btn rs-btnblack rs-btn-style1" to={to}>
            {inner}
          </Link>
        ) : (
          <a className="rs-btn rs-btnblack rs-btn-style1" href={href}>
            {inner}
          </a>
        )}
      </div>
    </EWidget>
  );
}

/** Elementor core "heading" widget. */
export function EHeading({ id, text, tag: Tag = 'h2' }) {
  return (
    <EWidget id={id} type="heading">
      <Tag className="elementor-heading-title elementor-size-default">{text}</Tag>
    </EWidget>
  );
}

/** Elementor core "text-editor" widget with CMS HTML. */
export function ETextEditor({ id, html }) {
  return (
    <EWidget id={id} type="text-editor">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </EWidget>
  );
}

/** Elementor core "image" widget. */
export function EImage({ id, src, width, height, className, alt = '', fetchPriority }) {
  return (
    <EWidget id={id} type="image">
      <img fetchpriority={fetchPriority} decoding="async" width={width} height={height} src={src} className={className} alt={alt} />
    </EWidget>
  );
}

/** RS Elements "rs-image-hover" widget (tilting image), used on the service pages and contact page. */
export function RsImageHover({ id, src, width, height, imgClass, fetchPriority }) {
  return (
    <EWidget id={id} type="rs-image-hover">
      <div className="elementor-image">
        <div className="image titlt" data-tilt="" data-tilt-max="3">
          <a>
            <img fetchpriority={fetchPriority} decoding="async" width={width} height={height} src={src} className={imgClass} alt="" />
          </a>
        </div>
      </div>
    </EWidget>
  );
}

/**
 * The `.main-contain` page wrapper used by the theme for regular pages.
 * With `article`, the content goes inside article#post-N > .entry-content;
 * pass `html` to inject captured CMS HTML directly as the entry content.
 */
export function MainContain({ children, col = 'col-lg-12', article, html, content = true }) {
  return (
    <div className="main-contain offcontents">
      <div className="container">
        <div id="content" className={content ? 'site-content' : undefined}>
          <div className="row padding-">
            <div className={col + ' '}>
              {article ? (
                <article id={'post-' + article.id} className={`post-${article.id} ${article.type || 'page type-page'} status-publish hentry`}>
                  {html !== undefined ? <div className="entry-content" dangerouslySetInnerHTML={{ __html: cleanHtml(html) }} /> : <div className="entry-content">{children}</div>}
                  {/* .entry-content */}
                </article>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
