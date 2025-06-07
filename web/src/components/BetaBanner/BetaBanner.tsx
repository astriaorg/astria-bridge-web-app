import type React from "react";
import { useConfig } from "config";

/**
 * A persistent banner displaying important site notices.
 */
export default function BetaBanner(): React.ReactElement {
  const { feedbackFormURL } = useConfig();

  return (
    <div
      className="beta-banner notification is-danger is-light"
      style={{ borderRadius: "0px" }}
    >
      <div className="is-flex is-align-items-center">
        <p className={`is-size-7-mobile ${feedbackFormURL ? "mr-6" : ""}`}>
          ⚠️ Flame is shutting down on <strong>September 30, 2025</strong>. You
          can still deposit TIA for gas, withdraw all assets, close LP
          positions, and swap tokens. However, you can no longer create new LP
          positions or add liquidity.
        </p>
        {feedbackFormURL && (
          <button
            type="button"
            className="button is-white has-text-danger is-small is-flex-shrink-0 ml-auto ml-6"
            onClick={() => {
              window.open(feedbackFormURL, "_blank", "noopener,noreferrer");
            }}
          >
            Share Feedback
          </button>
        )}
      </div>
    </div>
  );
}
