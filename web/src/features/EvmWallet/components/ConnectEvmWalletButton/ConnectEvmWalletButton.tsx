import jazzicon from "@metamask/jazzicon";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAccount } from "wagmi";

import CopyToClipboardButton from "components/CopyToClipboardButton/CopyToClipboardButton";

import { useEvmWallet } from "../../hooks/useEvmWallet.ts";
import { shortenAddress } from "../../utils/utils.ts";

interface ConnectEvmWalletButtonProps {
  // Label to show before the user is connected to a wallet.
  labelBeforeConnected?: string;
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export default function ConnectEvmWalletButton({
  labelBeforeConnected,
}: ConnectEvmWalletButtonProps) {
  const { connectEvmWallet, disconnectEvmWallet } = useEvmWallet();

  const userAccount = useAccount();
  console.log("userAccount", userAccount);

  // user avatar
  const avatarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (userAccount?.address && avatarRef.current) {
      avatarRef.current.innerHTML = "";
      // NOTE - only using jazzicon for the avatar right now.
      // this seed ensures we generate the same jazzicon as metamask
      const seed = Number.parseInt(userAccount.address.slice(2, 10), 16);
      const iconElem = jazzicon(24, seed);
      avatarRef.current.appendChild(iconElem);
    }
  }, [userAccount?.address]);

  // information dropdown
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
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
    if (userAccount?.address) {
      return shortenAddress(userAccount.address);
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, userAccount?.address]);

  // connect to wallet or show information dropdown
  const handleConnectWallet = useCallback(() => {
    if (!userAccount?.address) {
      connectEvmWallet();
    }
    if (userAccount?.address) {
      // if user is already connected, open information dropdown
      toggleDropdown();
    }
  }, [connectEvmWallet, toggleDropdown, userAccount?.address]);

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
          className="button is-ghost is-rounded-hover"
        >
          {userAccount?.address && (
            <span className="icon icon-left is-small" ref={avatarRef}>
              {/* this span is for the avatar and is updated via avatarRef */}
            </span>
          )}
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
      {isDropdownActive && userAccount.address && (
        <div className="dropdown-card card">
          {/* Top Row - Address and Actions */}
          <div className="dropdown-header">
            <div className="address-container">
              {/* FIXME - i don't think this html exists when the ref is set so it doesn't show the avatar */}
              <div className="avatar" ref={avatarRef} />
              <span className="address">
                {shortenAddress(userAccount.address)}
              </span>
            </div>
            <div className="action-buttons">
              <CopyToClipboardButton textToCopy={userAccount.address} />
              <button
                type="button"
                className="button is-ghost"
                onClick={() => disconnectEvmWallet()}
              >
                <span>
                  <i className="fas fa-up-right-from-square" />
                </span>
              </button>
              <button
                type="button"
                className="button is-ghost"
                onClick={() => disconnectEvmWallet()}
              >
                <span>
                  <i className="fas fa-power-off" />
                </span>
              </button>
            </div>
          </div>

          {/* Balance Row */}
          <div className="balance-container">
            <div className="balance-amount">0.00 TIA</div>
            <div className="balance-usd">$0.00 USD</div>
          </div>

          {/* Transactions Section */}
          <div className="transactions-container">
            <button
              type="button"
              className="transactions-header"
              onClick={() => setShowTransactions(!showTransactions)}
            >
              <span>Transactions</span>
              <i className="fas fa-chevron-right" />
            </button>

            {showTransactions && (
              <div className="transactions-list">
                <div className="no-transactions">No recent transactions</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
