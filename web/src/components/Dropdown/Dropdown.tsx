import React, { useCallback, useEffect, useRef, useState } from "react";

// DropdownOption is an interface for the options that can be selected in the dropdown.
export interface DropdownOption<T> {
  label: string;
  value: T;
  // leftIconClass allows for an icon to be displayed to the left of the option label in the dropdown content
  leftIconClass?: string;
}

// DropdownAdditionalOption is an interface for additional options that can be added to the dropdown.
// This is useful for adding extra options that have side effects outside the dropdown component.
export interface DropdownAdditionalOption {
  label: string;
  // action is the function that is called when the additional option is selected
  action: () => void;
  // className allows for additional classes to be added to the additional option
  className?: string;
  // leftIconClass allows for an icon to be displayed to the left of the label in the dropdown content
  leftIconClass?: string;
  // rightIconClass allows for an icon to be displayed to the right of the label in the dropdown content
  rightIconClass?: string;
}

interface DropdownProps<T> {
  options?: DropdownOption<T>[];
  onSelect: (value: T) => void;
  placeholder?: string;
  defaultOption?: DropdownOption<T>;
  disabled?: boolean;
  // leftIconClass allows for an icon to be displayed to the left of input for the dropdown label
  leftIconClass?: string;
  // additionalOptions allows for additional options with actions to be added to the dropdown
  additionalOptions?: DropdownAdditionalOption[];
  // valueOverride will trigger a call of onSelect in the component so the labels update correctly.
  //  This was needed to set the label correctly when the value is set via side effects from an
  //  additionalOption action
  valueOverride?: DropdownOption<T> | null;
}

export default function Dropdown<T>({
  options,
  onSelect,
  placeholder = "Select an option",
  defaultOption,
  disabled = false,
  leftIconClass,
  additionalOptions = [],
  valueOverride,
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

  useEffect(() => {
    if (valueOverride) {
      setSelectedOption(valueOverride);
      onSelect(valueOverride.value);
    }
    if (valueOverride === null) {
      setSelectedOption(null);
    }
  }, [valueOverride, onSelect]);

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
          className="button is-ghost is-outlined-light is-tall"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={toggleDropdown}
          disabled={disabled}
        >
          {/* only show left icon class if there isn't a selected option left icon class */}
          {leftIconClass && !selectedOption?.leftIconClass && (
            <span className="icon icon-left is-small ml-1 mr-3">
              <i className={leftIconClass} />
            </span>
          )}
          {selectedOption?.leftIconClass && (
            <span className="icon icon-left is-small ml-1 mr-3">
              <i className={selectedOption.leftIconClass} />
            </span>
          )}
          <span className="dropdown-label is-text-overflow">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="icon icon-right is-small">
            {isActive ? (
              <i className="fas fa-angle-up" />
            ) : (
              <i className="fas fa-angle-down" />
            )}
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
              <span className="dropdown-item-inner is-size-6">
                {option.leftIconClass && (
                  <span className="icon ml-1 mr-3">
                    <i className={option.leftIconClass} />
                  </span>
                )}
                {option.label}
              </span>
            </button>
          ))}

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
              <span className="dropdown-item-inner is-size-6">
                {option.leftIconClass && (
                  <span className="icon ml-1 mr-3">
                    <i className={option.leftIconClass} />
                  </span>
                )}
                <span className="dropdown-item-label is-text-overflow">
                  {option.label}
                </span>
                {option.rightIconClass && (
                  <span className="icon icon-right">
                    <i className={option.rightIconClass} />
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
