import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useConfig } from "config";
import logo from "logo-flame-w-text.svg";

function Navbar() {
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const onHamburgerClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    setIsMobileMenuActive((prev) => !prev);
  };

  const { brandURL, bridgeURL, swapURL, poolURL } = useConfig();

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
          {/* this link is always active right now since the bridge is a separate app */}
          <Link to="/" className="navbar-item is-active">
            BRIDGE
          </Link>
          <a
            target="_blank"
            href={swapURL}
            className="navbar-item"
            rel="noreferrer"
          >
            SWAP
          </a>
          <a
            target="_blank"
            href={poolURL}
            className="navbar-item"
            rel="noreferrer"
          >
            POOL
          </a>
        </div>
      </div>

      <div className="navbar-placeholder-end" />
    </nav>
  );
}

export default Navbar;
