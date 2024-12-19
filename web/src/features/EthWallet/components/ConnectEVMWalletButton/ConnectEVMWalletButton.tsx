import { useConnectModal } from "@rainbow-me/rainbowkit";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";

import { shortenAddress } from "../../utils/utils.ts";

interface ConnectEVMWalletButtonProps {
  labelBeforeConnected?: string;
  buttonClassNameOverride?: string;
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export default function ConnectEVMWalletButton({
  labelBeforeConnected,
  buttonClassNameOverride,
}: ConnectEVMWalletButtonProps) {
  const { openConnectModal } = useConnectModal();

  const userAccount = useAccount();
  console.log("userAccount", userAccount);

  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsDropdownActive(!isDropdownActive);
  }, [isDropdownActive]);

  const label = useMemo(() => {
    if (userAccount?.address) {
      return shortenAddress(userAccount.address);
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, userAccount?.address]);

  const openEVMWalletModal = useCallback(() => {
    if (!userAccount && openConnectModal) {
      openConnectModal();
    }
    if (userAccount) {
      // if user is already connected, open information dropdown
      toggleDropdown();
    }
  }, [openConnectModal, toggleDropdown, userAccount]);

  // button class can be overridden
  const className = useMemo(() => {
    const defaultClassName = "button is-ghost is-rounded-hover";
    return buttonClassNameOverride ?? defaultClassName;
  }, [buttonClassNameOverride]);

  return (
    <div
      ref={dropdownRef}
      className={`connect-wallet-dropdown ${isDropdownActive ? "is-active" : ""}`}
    >
      <div className="connect-wallet-button-container">
        <button
          type="button"
          key="connect-evm-wallet-button"
          onClick={openEVMWalletModal}
          className={className}
        >
          <span className="icon icon-left is-small">
            {/* TODO - replace with icon from wallet account */}
            <i className="fas fa-wallet" />
          </span>
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
    </div>
  );
}
