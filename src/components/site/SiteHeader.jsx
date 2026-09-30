import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_MENU, menuItemClasses } from '../../data/menu';
import { SITE } from '../../data/site';
import Icon from './Icons';

// Social links of the previous header's mobile menu (same URLs).
const SOCIAL = [
  ['https://www.facebook.com/aststrainingonline/', 'fa fa-facebook', 'Facebook'],
  ['https://twitter.com/AstsTraining ', 'fa fa-twitter', 'Twitter'],
  ['https://in.pinterest.com/aststrainingonline/ ', 'fa fa-pinterest-p', 'Pinterest'],
  ['https://in.linkedin.com/company/aststraining ', 'fa fa-linkedin', 'LinkedIn'],
  ['https://www.youtube.com/channel/UCUNAFNnfgjtCmPPfKr0b02g ', 'fa fa-youtube', 'YouTube'],
];

const state = (item, path) => {
  const cls = menuItemClasses(item, path);
  return {
    current: cls.includes('current-menu-item'),
    ancestor: cls.includes('current-menu-ancestor') || cls.includes('current_page_parent'),
  };
};

/**
 * Site header (redesign): fixed bar with logo, the primary menu with dropdowns,
 * the account/contact icon and the registration button; a slide-in drawer on
 * tablets and phones. Menu items, submenus and URLs come from data/menu.js.
 */
export default function SiteHeader() {
  const location = useLocation();
  const path = location.pathname;
  const [open, setOpen] = useState(false);
  const [subs, setSubs] = useState({});
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.key]);

  useEffect(() => {
    document.body.classList.toggle('nx-drawer-open', open);
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className={'nx-header' + (scrolled ? ' is-scrolled' : '')}>
        <div className="nx-container nx-header-inner">
          <Link to="/" rel="home" className="nx-logo">
            <img src={SITE.logo} alt="ASTSTraining" width="200" height="60" />
          </Link>
          <nav className="nx-nav" aria-label="Primary">
            <ul className="nx-menu">
              {PRIMARY_MENU.map((item) => {
                const s = state(item, path);
                return (
                  <li key={item.id} className={s.ancestor ? 'is-current' : undefined}>
                    <Link to={item.url} aria-current={s.current ? 'page' : undefined} aria-haspopup={item.children ? 'true' : undefined}>
                      {item.label}
                      {item.children ? <Icon name="chevronDown" className="nx-caret" /> : null}
                    </Link>
                    {item.children ? (
                      <ul className="nx-submenu">
                        {item.children.map((c) => (
                          <li key={c.id}>
                            <Link to={c.url} aria-current={state(c, path).current ? 'page' : undefined}>
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="nx-header-actions">
            <Link to="/contact/" className="nx-icon-btn login-icon" aria-label="Contact">
              <Icon name="user" />
            </Link>
            <Link to="/registration/" className="nx-btn nx-btn-primary nx-cta-desktop">
              Registration
            </Link>
            <button type="button" className="nx-icon-btn nx-burger" aria-label="Open menu" aria-expanded={open} aria-controls="nx-drawer" onClick={() => setOpen(true)}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>
      <div className="nx-header-spacer" aria-hidden="true"></div>

      <aside id="nx-drawer" className={'nx-drawer' + (open ? ' is-open' : '')} aria-label="Menu" aria-hidden={open ? undefined : 'true'}>
        <div className="nx-drawer-head">
          <Link to="/" rel="home" tabIndex={open ? undefined : -1}>
            <img src={SITE.stickyLogo} alt="ASTSTraining" width="160" height="48" />
          </Link>
          <button type="button" className="nx-icon-btn" aria-label="Close menu" tabIndex={open ? undefined : -1} onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <div className="nx-drawer-body">
          <ul className="nx-drawer-menu">
            {PRIMARY_MENU.map((item) => {
              const s = state(item, path);
              const expanded = !!subs[item.id];
              return (
                <li key={item.id}>
                  <div className="nx-drawer-row">
                    <Link to={item.url} aria-current={s.current ? 'page' : undefined} tabIndex={open ? undefined : -1}>
                      {item.label}
                    </Link>
                    {item.children ? (
                      <button
                        type="button"
                        className="nx-drawer-toggle"
                        aria-label={(expanded ? 'Hide ' : 'Show ') + item.label + ' pages'}
                        aria-expanded={expanded}
                        tabIndex={open ? undefined : -1}
                        onClick={() => setSubs((x) => ({ ...x, [item.id]: !x[item.id] }))}
                      >
                        <Icon name="chevronDown" />
                      </button>
                    ) : null}
                  </div>
                  {item.children ? (
                    <ul className="nx-drawer-sub" hidden={!expanded}>
                      {item.children.map((c) => (
                        <li key={c.id}>
                          <Link to={c.url} aria-current={state(c, path).current ? 'page' : undefined} tabIndex={open ? undefined : -1}>
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="nx-drawer-foot">
          <Link to="/registration/" className="nx-btn nx-btn-primary" tabIndex={open ? undefined : -1}>
            Registration
          </Link>
          <div className="nx-social">
            {SOCIAL.map(([href, icon, label]) => (
              <a key={icon} href={href} target="_blank" rel="noreferrer" aria-label={label} tabIndex={open ? undefined : -1}>
                <i className={icon} aria-hidden="true"></i>
              </a>
            ))}
          </div>
        </div>
      </aside>
      <div className={'nx-drawer-backdrop' + (open ? ' is-open' : '')} onClick={() => setOpen(false)} aria-hidden="true"></div>
    </>
  );
}
