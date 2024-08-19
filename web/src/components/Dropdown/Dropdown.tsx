import type React from "react";
import { useState } from "react";

export interface DropdownOption {
  label: string;
  value: any;
}

interface DropdownProps {
  options: DropdownOption[];
  onSelect: (value: any) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  placeholder = "Select an option",
}) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    null,
  );

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    setIsActive(false);
    onSelect(option.value);
  };

  return (
    <div className={`dropdown ${isActive ? "is-active" : ""}`}>
      <div className="dropdown-trigger">
        <button
          className="button is-ghost is-outlined-light is-tall"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          role="button"
          onClick={() => setIsActive(!isActive)}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {options.map((option) => (
            /* biome-ignore lint/a11y/useValidAnchor: Biome unfortunately uses anchors for tabs */
            <a
              key={option.value}
              className="dropdown-item"
              onClick={(e) => {
                e.preventDefault();
                handleSelect(option);
              }}
            >
              {option.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
