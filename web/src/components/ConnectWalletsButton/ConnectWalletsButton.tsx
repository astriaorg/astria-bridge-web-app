import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ConnectCosmosWalletButton,
  useCosmosWallet,
} from "features/CosmosWallet";
import { ConnectEvmWalletButton, useEvmWallet } from "features/EvmWallet";

/**
 * Button with dropdown to connect to multiple wallets.
 */
export default function ConnectWalletsButton() {
  // information dropdown
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = useCallback(() => {
    setIsDropdownActive(!isDropdownActive);
  }, [isDropdownActive]);

  const { cosmosAccountAddress, selectedCosmosChain } = useCosmosWallet();
  const { evmAccountAddress, selectedEvmChain } = useEvmWallet();

  console.log({
    cosmosAccountAddress,
    evmAccountAddress,
  });

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
    if (!cosmosAccountAddress && !evmAccountAddress) {
      return "Connect |";
    }
    if (cosmosAccountAddress && evmAccountAddress) {
      return "2 Connected";
    }
    // TODO - show icons of wallets connected?
    //  e.g. <metamask icon> Connected <leap icon> Connected?
    return "1 Connected";
  }, [cosmosAccountAddress, evmAccountAddress]);

  return (
    <div
      ref={dropdownRef}
      className={`connect-wallet ${isDropdownActive ? "is-active" : ""}`}
    >
      <div className="connect-wallet-button-container">
        <button
          type="button"
          key="connect-networks-button"
          onClick={toggleDropdown}
          className="button is-ghost is-rounded-hover"
        >
          <span className="connect-wallet-button-label">{label}</span>
          <span className="icon icon-right is-small ml-0">
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
              <ConnectEvmWalletButton
                labelBeforeConnected="Connect Flame wallet"
                blockExplorerURL={selectedEvmChain?.blockExplorerUrl}
              />
            </div>
            <div>
              <ConnectCosmosWalletButton
                labelBeforeConnected="Connect Cosmos wallet"
                blockExplorerURL={selectedCosmosChain?.blockExplorerUrl}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
