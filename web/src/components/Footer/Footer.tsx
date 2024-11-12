import type React from "react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="footer is-flex-align-items-flex-end mt-auto">
      <div className="content has-text-centered">
        <p>
          &copy; 2024. All Rights Reserved.{" "}
          <a href="https://www.astria.org/">Astria.org</a>
        </p>
        <p>
          <a
            target="_blank"
            href="https://www.astria.org/terms"
            rel="noreferrer"
          >
            Terms of Service.
          </a>{" "}
          <a
            target="_blank"
            href="https://www.astria.org/privacy"
            rel="noreferrer"
          >
            Privacy Policy.
          </a>
        </p>
      </div>
    </footer>
  );
}
