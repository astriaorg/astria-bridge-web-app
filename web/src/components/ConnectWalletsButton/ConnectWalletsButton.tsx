import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ConnectCosmosWalletButton } from "features/CosmosWallet";
import { ConnectEvmWalletButton } from "features/EvmWallet";

interface ConnectWalletsButtonProps {
  // Label to show before the user is connected to any wallets.
  labelBeforeConnected?: string;
}

/**
 * Button with dropdown to connect to multiple wallets.
 */
export default function ConnectWalletsButton({
  labelBeforeConnected,
}: ConnectWalletsButtonProps) {
  // information dropdown
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = useCallback(() => {
    setIsDropdownActive(!isDropdownActive);
  }, [isDropdownActive]);

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

  // ui
  const label = useMemo(() => {
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected]);

  return (
    <div
      ref={dropdownRef}
      className={`connect-wallet-dropdown ${isDropdownActive ? "is-active" : ""}`}
    >
      <div className="connect-wallet-button-container">
        <button
          type="button"
          key="connect-evm-wallet-button"
          onClick={toggleDropdown}
          className="button is-ghost is-rounded-hover"
        >
          <span className="connect-wallet-button-label">{label}</span>
          <span className="icon icon-right is-small">
            {isDropdownActive ? (
              <i className="fas fa-angle-up" />
            ) : (
              <i className="fas fa-angle-down" />
            )}
          </span>
        </button>
      </div>

      {/* Dropdown element */}
      {isDropdownActive && (
        <div className="dropdown-card card">
          <div className="">
            <div>
              <ConnectEvmWalletButton labelBeforeConnected="Connect to Flame wallet" />
            </div>
            <div>
              <ConnectCosmosWalletButton labelBeforeConnected="Connect to Cosmos wallet" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
