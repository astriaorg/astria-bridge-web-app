import { useState } from "react";

export default function CopyToClipboardButton({
  textToCopy,
}: {
  textToCopy: string | undefined;
}) {
  const [copyStatus, setCopyStatus] = useState("");

  const [fadeInClass, setFadeInClass] = useState("");

  const copyToClipboard = (text: string) => {
    // we only want the icon to fade in after it's clicked, not on first page render.
    setFadeInClass("fade-in");
    void navigator.clipboard.writeText(text);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(""), 500);
  };

  if (!textToCopy) {
    return <></>;
  }

  return (
    <>
      <button
        type="button"
        key={textToCopy}
        onClick={() => copyToClipboard(textToCopy)}
        className="button has-text-light is-ghost"
      >
        {copyStatus && <div className="fade-out">{copyStatus}</div>}
        {!copyStatus && (
          <span className={`icon ${fadeInClass}`}>
            <i className="fas fa-clipboard" />
          </span>
        )}
      </button>
    </>
  );
}
