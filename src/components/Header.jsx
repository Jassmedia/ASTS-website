import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_MENU, menuItemClasses } from '../data/menu';
import { SITE } from '../data/site';
import { useStickyHeader } from '../hooks/useSiteBehaviours';
import { withWhitespace } from '../lib/jsx';
import PageBanner from './PageBanner';

/** One <li> of the primary menu with the same classes WordPress prints on the current site. */
function MenuItem({ item, path, withIds }) {
  const [hover, setHover] = useState(false);
  const base = menuItemClasses(item, path);
  const cls = base + (hover && item.children ? ' hover-minimize' : '');
  return (
    <li
      id={withIds ? 'menu-item-' + item.id : undefined}
      className={cls}
      onMouseEnter={item.children ? () => setHover(true) : undefined}
      onMouseLeave={item.children ? () => setHover(false) : undefined}
    >
      <Link to={item.url} aria-current={base.includes('current-menu-item') ? 'page' : undefined}>
        {item.label}
      </Link>
      {item.children ? (
        <ul className="sub-menu">
          {withWhitespace(
            item.children.map((c) => (
              <li key={c.id} id={withIds ? 'menu-item-' + c.id : undefined} className={menuItemClasses(c, path)}>
                <Link to={c.url} aria-current={menuItemClasses(c, path).includes('current-menu-item') ? 'page' : undefined}>
                  {c.label}
                </Link>
              </li>
            )),
          )}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * The site header (theme "header-style5"): logo, primary menu, and the
 * three-dot mobile menu button, followed by the page banner on inner pages.
 */
export default function Header({ banner, onMenuButton }) {
  const { pathname } = useLocation();
  const innerRef = useRef(null);
  useStickyHeader(innerRef);

  return (
    <header id="rs-header" className="single-header header-style5 mainsmenu        ">
      <div className="sticky-wrapper">
        <div className="header-inner  menu-sticky" ref={innerRef}>
          {/* Header Menu Start */}
          <div className="menu-area menu_type_">
            <div className="container">
              <div className="row-table">
                <div className="col-cell header-logo">
                  <div className="logo-area">
                    <Link to="/" rel="home">
                      <img src={SITE.logo} alt="ASTSTraining" />
                    </Link>
                  </div>
                  <div className="logo-area sticky-logo">
                    <Link to="/" rel="home">
                      <img style={{ maxHeight: 55 }} src={SITE.stickyLogo} alt="ASTSTraining" />
                    </Link>
                  </div>
                </div>
                <div className="col-cell menu-responsive">
                  <nav className="nav navbar">
                    <div className="navbar-menu">
                      <div className="menu-top-menu-container">
                        <ul id="primary-menu-single" className="menu">
                          {withWhitespace(PRIMARY_MENU.map((item) => <MenuItem key={item.id} item={item} path={pathname} />))}
                        </ul>
                      </div>
                    </div>
                  </nav>
                </div>
                <div className="col-cell header-quote">
                  <div className="user-icons">
                    <Link to="/contact/" className="login-icon">
                      <i className="far fa-user" aria-hidden="true"></i>
                    </Link>
                  </div>
                  <div className="sidebarmenu-area text-right mobilehum">
                    <ul className="offcanvas-icon">
                      <li className="nav-link-container">
                        <a
                          href="#"
                          className="nav-menu-link menu-button"
                          onClick={(e) => {
                            e.preventDefault();
                            onMenuButton();
                          }}
                        >
                          <span className="dot1"></span>
                          <span className="dot2"></span>
                          <span className="dot3"></span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Header Menu End */}
        </div>
      </div>
      {/* End Slider area */}
      <PageBanner banner={banner} />
    </header>
  );
}

const OFFCANVAS_SOCIAL = [
  ['https://www.facebook.com/aststrainingonline/', 'fa fa-facebook'],
  ['https://twitter.com/AstsTraining ', 'fa fa-twitter'],
  ['https://in.pinterest.com/aststrainingonline/ ', 'fa fa-pinterest-p'],
  ['https://in.linkedin.com/company/aststraining ', 'fa fa-linkedin'],
  ['https://www.youtube.com/channel/UCUNAFNnfgjtCmPPfKr0b02g ', 'fa fa-youtube'],
];

/**
 * Off-canvas navigation (theme ".menu-wrap-off"), rendered before the header
 * inside #page. Opened by the three-dot button on small screens.
 * Sub menus use the theme's "menumaker" behaviour (submenu-button toggles).
 */
export function OffcanvasNav({ open, onClose }) {
  const { pathname } = useLocation();
  const [openSubs, setOpenSubs] = useState({});
  const toggle = (id) => setOpenSubs((s) => ({ ...s, [id]: !s[id] }));

  return (
    <nav className={'menu-wrap-off nav-container nav menu-ofcn' + (open ? ' off-open' : '')}>
      <div className="inner-offcan">
        <div className="nav-link-container">
          <a
            href="#"
            className={'nav-menu-link close-button' + (open ? ' off-open' : '')}
            id="close-button2"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            <span className="hamburger1"></span>
            <span className="hamburger3"></span>
          </a>
        </div>
        <div className="sidenav offcanvas-icon">
          <div id="mobile_menu" className="rs-offcanvas-inner-left">
            <div className="widget widget_nav_menu mobile-menus">
              <div className="menu-top-menu-container">
                <ul id="primary-menu-single1" className="menu">
                  {withWhitespace(
                    PRIMARY_MENU.map((item) => {
                      const cls = menuItemClasses(item, pathname) + (item.children ? ' has-sub' : '');
                      return (
                        <li key={item.id} id={'menu-item-' + item.id} className={cls}>
                          {item.children ? (
                            <span
                              className={'submenu-button' + (openSubs[item.id] ? ' submenu-opened' : '')}
                              onClick={() => toggle(item.id)}
                            ></span>
                          ) : null}
                          <Link to={item.url} onClick={onClose}>
                            {item.label}
                          </Link>
                          {item.children ? (
                            <ul className={'sub-menu' + (openSubs[item.id] ? ' open-sub' : '')} style={{ display: openSubs[item.id] ? 'block' : 'none' }}>
                              {withWhitespace(
                                item.children.map((c) => (
                                  <li key={c.id} id={'menu-item-' + c.id} className={menuItemClasses(c, pathname)}>
                                    <Link to={c.url} onClick={onClose}>
                                      {c.label}
                                    </Link>
                                  </li>
                                )),
                              )}
                            </ul>
                          ) : null}
                        </li>
                      );
                    }),
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * The theme's secondary "responsive-menus" block. It exists in the current
 * site's DOM but is hidden by CSS (display:none !important); kept for parity.
 */
export function ResponsiveMenus() {
  const { pathname } = useLocation();
  return (
    <div className="responsive-menus">
      <nav className="nav-container mobile-menu-container mobile-menus menu-wrap-off fdgdgfdg">
        <ul className="sidenav">
          <li className="nav-link-container">
            <a href="#" className="nav-menu-link close-button" onClick={(e) => e.preventDefault()}>
              <span className="hamburger1"></span>
              <span className="hamburger3"></span>
            </a>
          </li>
          <li>
            <div className="menu-top-menu-container">
              <ul id="primary-menu-single2" className="menu">
                {withWhitespace(
                  PRIMARY_MENU.map((item) => (
                    <li key={item.id} className={menuItemClasses(item, pathname)}>
                      <Link to={item.url}>{item.label}</Link>
                      {item.children ? (
                        <ul className="sub-menu">
                          {withWhitespace(
                            item.children.map((c) => (
                              <li key={c.id} className={menuItemClasses(c, pathname)}>
                                <Link to={c.url}>{c.label}</Link>
                              </li>
                            )),
                          )}
                        </ul>
                      ) : null}
                    </li>
                  )),
                )}
              </ul>
            </div>
          </li>
        </ul>
        <div className="social-icon-responsive">
          <ul className="offcanvas_social">
            {withWhitespace(
              OFFCANVAS_SOCIAL.map(([href, icon]) => (
                <li key={icon}>
                  <a href={href} target="_blank" rel="noreferrer">
                    <span>
                      <i className={icon}></i>
                    </span>
                  </a>
                </li>
              )),
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
}
