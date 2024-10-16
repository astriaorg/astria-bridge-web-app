import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../logo-flame-w-text.svg";

function Navbar() {
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const onHamburgerClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    setIsMobileMenuActive((prev) => !prev);
  };

  const brandLink = "https://www.astria.org/";
  const bridgeLink = "https://bridge.astria.org/";
  const swapLink = "https://flame.astria.org/";
  const poolLink = "https://flame.astria.org/";

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
        className={`navbar-menu ${isMobileMenuActive && "navbar-menu-dropdown is-active"}`}
      >
        <div className="navbar-middle has-text-weight-medium is-family-monospace">
          <Link to="/" className="navbar-item">
            BRIDGE
          </Link>
          <a target="_blank" href={swapLink} className="navbar-item">
            SWAP
          </a>
          <a target="_blank" href={poolLink} className="navbar-item">
            POOL
          </a>
        </div>

      </div>

      <div className="navbar-placeholder-end" />
    </nav>
  );
}

export default Navbar;
