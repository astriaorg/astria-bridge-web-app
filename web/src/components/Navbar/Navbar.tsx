import type React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useConfig } from "config";
import logo from "logo-flame-w-text.svg";

function Navbar() {
  const { pathname } = useLocation();
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const onHamburgerClick = (_: React.SyntheticEvent<HTMLButtonElement>) => {
    setIsMobileMenuActive((prev) => !prev);
  };

  const { brandURL } = useConfig();
  
  return (
    <nav
      className="navbar is-spaced is-transparent"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <a
          target="_blank"
          href={brandURL}
          className="navbar-item"
          rel="noreferrer"
        >
          <img src={logo} width="161" height="32" alt="logo" />
        </a>
        <button
          type="button"
          className={`navbar-burger ${isMobileMenuActive && "is-active"}`}
          aria-label="menu"
          aria-expanded="false"
          data-target="topNavbar"
          onClick={onHamburgerClick}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div
        id="topNavbar"
        className={`navbar-menu ${
          isMobileMenuActive && "navbar-menu-dropdown is-active"
        }`}
      >
        <div className="navbar-middle has-text-weight-medium is-family-monospace">
          <Link to="/" className={`navbar-item ${pathname === '/' ? 'is-active' : ''}`}>
            BRIDGE
          </Link>
          <Link to="/swap" className={`navbar-item ${pathname === '/swap' ? 'is-active' : ''}`}>
            SWAP
          </Link>
          <Link to="/pool" className={`navbar-item ${pathname === '/pool' ? 'is-active' : ''}`}>
            POOL
          </Link>
        </div>
      </div>

      <div className="navbar-placeholder-end" />
    </nav>
  );
}

export default Navbar;
