import React, { useState, useEffect, useCallback } from "react";

export interface DropdownOption<T> {
  label: string;
  value: T;
}

export interface DropdownAdditionalOption {
  label: string;
  action: () => void;
  className?: string;
  icon?: string;
}

interface DropdownProps<T> {
  options?: DropdownOption<T>[];
  onSelect: (value: T) => void;
  placeholder?: string;
  defaultOption?: DropdownOption<T>;
  disabled?: boolean;
  additionalOptions?: DropdownAdditionalOption[];
}

function Dropdown<T>({
  options,
  onSelect,
  placeholder = "Select an option",
  defaultOption,
  disabled = false,
  additionalOptions = [],
}: DropdownProps<T>) {
  const [isActive, setIsActive] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<DropdownOption<T> | null>(defaultOption || null);

  // set the default option when defaultOption or onSelect change
  useEffect(() => {
    if (defaultOption) {
      setSelectedOption(defaultOption);
      onSelect(defaultOption.value);
    }
  }, [defaultOption, onSelect]);

  const handleSelect = useCallback(
    (option: DropdownOption<T>) => {
      setSelectedOption(option);
      setIsActive(false);
      onSelect(option.value);
    },
    [onSelect],
  );

  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsActive(!isActive);
    }
  }, [disabled]);

  return (
    <div
      className={`dropdown ${isActive ? "is-active" : ""} ${
        disabled ? "is-disabled" : ""
      }`}
    >
      <div className="dropdown-trigger">
        <button
          type="button"
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={toggleDropdown}
          disabled={disabled}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true" />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {options?.map((option) => (
            <a
              key={option.label}
              className={`dropdown-item ${
                selectedOption?.value === option.value ? "is-active" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </a>
          ))}
          {additionalOptions.length > 0 && <hr className="dropdown-divider" />}
          {additionalOptions.map((option, index) => (
            <a
              key={`additional-${index}`}
              className={`dropdown-item ${option.className || ""}`}
              onClick={() => {
                option.action();
                setIsActive(false);
              }}
            >
              {option.icon && (
                <span className="icon">
                  <i className={option.icon} />
                </span>
              )}
              <span>{option.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
