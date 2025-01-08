import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// DropdownOption is an interface for the options that can be selected in the dropdown.
export interface DropdownOption<T> {
  label: string;
  value: T;
  LeftIcon?: FC<{className?: string; size?: number}>;
}

// DropdownAdditionalOption is an interface for additional options that can be added to the dropdown.
// This is useful for adding extra options that have side effects outside the dropdown component.
export interface DropdownAdditionalOption {
  label: string;
  // action is the function that is called when the additional option is selected
  action: () => void;
  // className allows for additional classes to be added to the additional option
  className?: string;
  // LeftIcon allows for an icon to be displayed to the left of the label in the dropdown content
  LeftIcon?: FC<{className?: string; size?: number}>;
  // RightIcon allows for an icon to be displayed to the right of the label in the dropdown content
  RightIcon?: FC<{className?: string; size?: number}>;
}

interface DropdownProps<T> {
  options?: DropdownOption<T>[];
  onSelect: (value: T) => void;
  placeholder?: string;
  defaultOption?: DropdownOption<T>;
  disabled?: boolean;
  // leftIconClass allows for an icon to be displayed to the left of input for the dropdown label
  LeftIcon?: FC;
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
  LeftIcon,
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
      className={`relative w-full ${isActive ? "z-50" : ""} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="w-full">
        <button
          type="button"
          className="w-full flex items-center justify-between bg-transparent text-grey-light hover:bg-opacity-5 hover:bg-white px-4 py-2 disabled:opacity-50 border border-dark rounded-xl h-14"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={toggleDropdown}
          disabled={disabled}
        >
          {LeftIcon && !selectedOption?.LeftIcon && (
            <span className="text-grey-light ml-1 mr-3 flex">
              <LeftIcon />
            </span>
          )}
          {selectedOption?.LeftIcon && (
            <span className="text-grey-light ml-1 mr-3 flex">
              <selectedOption.LeftIcon />
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="ml-auto text-grey-light">
            <i className={`fas fa-angle-${isActive ? 'up' : 'down'}`} />
          </span>
        </button>
      </div>
      {isActive && (
        <div className="absolute w-full mt-2" id="dropdown-menu" role="menu">
          <div className="bg-radial-dark border border-white/10 shadow-inner rounded-2xl p-2">
            {options?.map((option) => (
              <button
                type="button"
                key={option.label}
                className={`w-full text-left ${
                  selectedOption?.value === option.value ? "bg-white/5" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                <span className="flex items-center w-full p-4 text-sm rounded-xl hover:bg-white/5 transition-colors">
                  {option.LeftIcon && (
                    <span className="ml-1 mr-3 flex">
                      <option.LeftIcon />
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
                className={`w-full text-left text-white ${option.className || ""}`}
                onClick={() => {
                  option.action();
                  setIsActive(false);
                }}
              >
                <span className="flex items-center justify-between w-full p-4 text-sm rounded-xl hover:bg-white/5 transition-colors">
                  <span className="flex items-center">
                    {option.LeftIcon && (
                      <span className="ml-1 mr-3 text-white flex">
                        <option.LeftIcon />
                      </span>
                    )}
                    <span className="truncate flex-grow">
                      {option.label}
                    </span>
                  </span>
                  {option.RightIcon && (
                    <span className="text-white flex">
                      <option.RightIcon size={20}/>
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
