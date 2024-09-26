import React, { useCallback, useEffect, useRef, useState } from "react";

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
  leftIcon?: string;
  // additionalOptions allows for additional options with actions to be added to the dropdown
  additionalOptions?: DropdownAdditionalOption[];
  // additionalOptionSelectedLabel allows for a label to be displayed when an additional option is selected.
  //  This value is set by the parent component because the additional options generally have side effects
  //  outside of this component.
  additionalOptionSelectedLabel?: string;
}

function Dropdown<T>({
  options,
  onSelect,
  placeholder = "Select an option",
  defaultOption,
  disabled = false,
  leftIcon,
  additionalOptions = [],
  additionalOptionSelectedLabel,
}: DropdownProps<T>) {
  const [isActive, setIsActive] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<DropdownOption<T> | null>(defaultOption || null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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
  }, [disabled, isActive]);

  return (
    <div
      ref={dropdownRef}
      className={`dropdown ${isActive ? "is-active" : ""} ${
        disabled ? "is-disabled" : ""
      }`}
    >
      <div className="dropdown-trigger">
        <button
          type="button"
          className="button is-ghost is-outlined-light"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={toggleDropdown}
          disabled={disabled}
        >
          {leftIcon && (
            <span className="icon is-small mr-2 dropdown-icon-left">
              <i className={leftIcon} />
            </span>
          )}
          {additionalOptionSelectedLabel && (
            <span className="dropdown-label is-text-overflow">
              {additionalOptionSelectedLabel}
            </span>
          )}
          {!additionalOptionSelectedLabel && (
            <span className="dropdown-label is-text-overflow">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
          <span className="icon is-small dropdown-icon-right">
            <i className="fas fa-angle-down" />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {options?.map((option) => (
            <button
              type="button"
              key={option.label}
              className={`dropdown-item ${
                selectedOption?.value === option.value ? "is-active" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          ))}
          {!!(options?.length && additionalOptions?.length) && (
            <hr className="dropdown-divider" />
          )}
          {additionalOptions.map((option) => (
            <button
              type="button"
              key={`additional-${option.label}`}
              className={`additional-dropdown-item dropdown-item ${
                option.className || ""
              }`}
              onClick={() => {
                option.action();
                setIsActive(false);
              }}
            >
              <span>{option.label}</span>
              {option.icon && (
                <span className="icon">
                  <i className={option.icon} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
