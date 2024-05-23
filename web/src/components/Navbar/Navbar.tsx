import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../logo.svg";

function Navbar() {
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const onHamburgerClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    setIsMobileMenuActive((prev) => !prev);
  };

  const brandLink = "/";

  return (
    <nav
      className="navbar is-spaced is-transparent"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <Link className="navbar-item" to={brandLink}>
          <img src={logo} width="161" height="32" alt="logo" />
        </Link>
        <button
          className={`navbar-burger ${isMobileMenuActive && "is-active"}`}
          aria-label="menu"
          aria-expanded="false"
          data-target="topNavbar"
          onClick={onHamburgerClick}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div
        id="topNavbar"
        className={`navbar-menu ${isMobileMenuActive && "is-active"}`}
      >
        <div className="navbar-start"></div>
      </div>
    </nav>
  );
}

export default Navbar;
