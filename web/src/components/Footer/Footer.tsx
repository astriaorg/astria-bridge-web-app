import type React from "react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="footer is-flex-align-items-flex-end mt-auto">
      <div className="content has-text-centered">
        <p>
          Powered by <a href="https://www.astria.org/">Astria</a>
        </p>
      </div>
    </footer>
  );
}
