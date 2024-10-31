import type React from "react";

interface SideTagProps {
  label: string;
  url: string;
  iconClass: string;
}

export default function SideTag({
  label,
  url,
  iconClass,
}: SideTagProps): React.ReactElement {
  return (
    <div className="side-tag">
      <a href={url} target="_blank" rel="noreferrer" className="side-tag-link">
        <span className="icon is-small">
          {/* TODO - up-right-from-square icon; not in our version of font-awesome? */}
          <i className={`fas ${iconClass}`} />
        </span>
        <span className="label">{label}</span>
      </a>
    </div>
  );
}
