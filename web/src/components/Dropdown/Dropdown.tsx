import type React from "react";
import { useState } from "react";

export interface DropdownOption<T> {
  label: string;
  value: T;
}

interface DropdownProps<T> {
  options: DropdownOption<T>[];
  onSelect: (value: T) => void;
  placeholder?: string;
}

function Dropdown<T>({
  options,
  onSelect,
  placeholder = "Select an option",
}: DropdownProps<T>) {
  const [isActive, setIsActive] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<DropdownOption<T> | null>(null);

  const handleSelect = (option: DropdownOption<T>) => {
    setSelectedOption(option);
    setIsActive(false);
    onSelect(option.value);
  };

  return (
    <div className={`dropdown ${isActive ? "is-active" : ""}`}>
      <div className="dropdown-trigger">
        <button
          type="button"
          className="button is-ghost is-outlined-light is-tall"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          role="button"
          onClick={() => setIsActive(!isActive)}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down" />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {options.map((option) => (
            <a
              key={option.label}
              className="dropdown-item"
              /* biome-ignore lint/a11y/useValidAnchor: Biome unfortunately uses anchors for tabs */
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
}

export default Dropdown;
