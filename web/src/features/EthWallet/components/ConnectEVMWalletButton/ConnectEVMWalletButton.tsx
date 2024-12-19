import jazzicon from "@metamask/jazzicon";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

  // user avatar
  const avatarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (userAccount?.address && avatarRef.current) {
      avatarRef.current.innerHTML = "";
      // NOTE - only using jazzicon for the avatar right now
      // this seed ensures we generate the same jazzicon as metamask
      const seed = Number.parseInt(userAccount.address.slice(2, 10), 16);
      const iconElem = jazzicon(24, seed);
      avatarRef.current.appendChild(iconElem);
    }
  }, [userAccount?.address]);

  // information dropdown
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = useCallback(() => {
    setIsDropdownActive(!isDropdownActive);
  }, [isDropdownActive]);

  // ui
  const label = useMemo(() => {
    if (userAccount?.address) {
      return shortenAddress(userAccount.address);
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, userAccount?.address]);
  // button class can be overridden
  const className = useMemo(() => {
    const defaultClassName = "button is-ghost is-rounded-hover";
    return buttonClassNameOverride ?? defaultClassName;
  }, [buttonClassNameOverride]);
  // connect to wallet or show information dropdown
  const handleConnectWallet = useCallback(() => {
    if (!userAccount?.address && openConnectModal) {
      openConnectModal();
    }
    if (userAccount?.address) {
      // if user is already connected, open information dropdown
      toggleDropdown();
    }
  }, [openConnectModal, toggleDropdown, userAccount?.address]);

  return (
    <div
      ref={dropdownRef}
      className={`connect-wallet-dropdown ${isDropdownActive ? "is-active" : ""}`}
    >
      <div className="connect-wallet-button-container">
        <button
          type="button"
          key="connect-evm-wallet-button"
          onClick={handleConnectWallet}
          className={className}
        >
          <span className="icon icon-left is-small" ref={avatarRef}>
            {/* this span is for the avatar and is updated via avatarRef */}
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
