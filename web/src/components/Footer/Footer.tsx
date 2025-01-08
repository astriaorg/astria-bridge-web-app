import type React from "react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="mt-auto">
      <div className="text-center">
        <p>
          &copy; 2024. All Rights Reserved.{" "}
          <a href="https://www.astria.org/" className="text-orange-soft hover:underline">
            Astria.org
          </a>
        </p>
        <p>
          <a
            target="_blank"
            href="https://www.astria.org/terms"
            rel="noreferrer"
            className="text-orange-soft hover:underline"
          >
            Terms of Service.
          </a>{" "}
          <a
            target="_blank"
            href="https://www.astria.org/privacy"
            rel="noreferrer"
            className="text-orange-soft hover:underline"
          >
            Privacy Policy.
          </a>
        </p>
      </div>
    </footer>
  );
}
