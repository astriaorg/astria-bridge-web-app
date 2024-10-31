import type React from "react";

interface SideTagProps {
  label: string;
  url: string;
  iconClass: string;
}

/**
 * SideTag component to render a side tag with an icon and label.
 * @param label
 * @param url
 * @param iconClass
 */
export default function SideTag({
  label,
  url,
  iconClass,
}: SideTagProps): React.ReactElement {
  return (
    <div className="side-tag">
      <a href={url} target="_blank" rel="noreferrer" className="side-tag-link">
        <span className="icon is-small">
          <i className={`fas ${iconClass}`} />
        </span>
        <span className="label">{label}</span>
      </a>
    </div>
  );
}
