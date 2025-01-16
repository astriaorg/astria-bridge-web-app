import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FlameNetwork } from "../../chainConfigs";
import { useConfig } from "../../hooks/useConfig.ts";

import "./network-selector.scss";

export default function NetworkSelector(): React.ReactElement {
  const { selectedFlameNetwork, selectFlameNetwork, networksList } =
    useConfig();
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownActive(!isDropdownActive);
  }, [isDropdownActive]);

  const handleNetworkSelect = useCallback(
    (network: FlameNetwork) => {
      console.log("network", network);
      selectFlameNetwork(network);
      setIsDropdownActive(false);
    },
    [selectFlameNetwork],
  );

  const getNetworkDisplayName = (network: FlameNetwork): string => {
    return network.charAt(0).toUpperCase() + network.slice(1);
  };

  return (
    <div
      ref={dropdownRef}
      className={`network-selector ${isDropdownActive ? "is-active" : ""}`}
    >
      <div className="network-selector-button-container">
        <button
          type="button"
          onClick={toggleDropdown}
          className="button is-ghost is-rounded-hover"
        >
          <span className="icon icon-left is-small">
            <i className="i-flame" />
          </span>
          <span className="network-selector-button-label is-hidden-touch">
            {getNetworkDisplayName(selectedFlameNetwork)}
          </span>
          <span className="icon icon-right is-small">
            {isDropdownActive ? (
              <i className="fas fa-angle-up" />
            ) : (
              <i className="fas fa-angle-down" />
            )}
          </span>
        </button>
      </div>

      {isDropdownActive && (
        <div className="dropdown-card card">
          <div className="dropdown-content">
            {networksList.map((network) => (
              <button
                key={network}
                type="button"
                className={`dropdown-item ${
                  network === selectedFlameNetwork ? "is-active" : ""
                }`}
                onClick={() => handleNetworkSelect(network)}
              >
                <span className="dropdown-item-inner is-size-6">
                  <span className="icon ml-1 mr-3">
                    <i className="i-flame" />
                  </span>
                  {getNetworkDisplayName(network)}
                  <span className="icon icon-right">
                    {network === selectedFlameNetwork && (
                      <i className="fas fa-check" />
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
