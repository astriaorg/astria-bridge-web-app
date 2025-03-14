import type React from "react";

/**
 * A persistent banner that links to the beta version of the site
 */
export default function BetaBanner(): React.ReactElement {
  return (
    <div className="beta-banner">
      <a
        href="https://beta.flame.astria.org"
        target="_blank"
        rel="noopener noreferrer"
        className="beta-banner-link"
      >
        Try the New Beta Bridge and Swap Website
      </a>
    </div>
  );
}
