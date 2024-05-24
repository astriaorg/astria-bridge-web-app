import type React from "react";
import { useState } from "react";
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
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <Link className="navbar-item" to={brandLink}>
          <img src={logo} width="161" height="32" alt="logo" />
        </Link>
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
        className={`navbar-menu ${isMobileMenuActive && "is-active"}`}
      >
        <div className="navbar-start" />
      </div>
    </nav>
  );
}

export default Navbar;
