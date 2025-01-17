import jazzicon from "@metamask/jazzicon";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CopyToClipboardButton from "components/CopyToClipboardButton/CopyToClipboardButton";
import { shortenAddress } from "features/shared/utils.ts";

import { useEvmWallet } from "../../hooks/useEvmWallet";

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
  const {
    connectEvmWallet,
    disconnectEvmWallet,
    evmNativeTokenBalance,
    isLoadingEvmNativeTokenBalance,
    evmAccountAddress,
  } = useEvmWallet();

  // user avatar
  const avatarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (evmAccountAddress && avatarRef.current) {
      avatarRef.current.innerHTML = "";
      // NOTE - only using jazzicon for the avatar right now.
      // this seed ensures we generate the same jazzicon as metamask
      const seed = Number.parseInt(evmAccountAddress.slice(2, 10), 16);
      const iconElem = jazzicon(24, seed);
      avatarRef.current.appendChild(iconElem);
    }
  }, [evmAccountAddress]);

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
    if (evmAccountAddress) {
      return shortenAddress(evmAccountAddress);
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, evmAccountAddress]);

  // connect to wallet or show information dropdown
  const handleConnectWallet = useCallback(() => {
    if (!evmAccountAddress) {
      connectEvmWallet();
    }
    if (evmAccountAddress) {
      // if user is already connected, open information dropdown
      toggleDropdown();
    }
  }, [connectEvmWallet, toggleDropdown, evmAccountAddress]);

  return (
    <div
      ref={dropdownRef}
      className={`connect-wallet ${isDropdownActive ? "is-active" : ""}`}
    >
      <div className="connect-wallet-button-container">
        <button
          type="button"
          key="connect-evm-wallet-button"
          onClick={handleConnectWallet}
          className="button is-ghost is-rounded-hover"
        >
          {evmAccountAddress && (
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
      {isDropdownActive && evmAccountAddress && (
        <div className="dropdown-card card">
          {/* Top Row - Address and Actions */}
          <div className="dropdown-header">
            <div className="address-container">
              {/* FIXME - i don't think this html exists when the ref is set so it doesn't show the avatar */}
              <div className="avatar" ref={avatarRef} />
              <span className="address">
                {shortenAddress(evmAccountAddress)}
              </span>
            </div>
            <div className="action-buttons">
              <CopyToClipboardButton textToCopy={evmAccountAddress} />
              <button
                type="button"
                className="button is-ghost"
                onClick={() => {
                  console.log("TODO open explorer");
                }}
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
            {isLoadingEvmNativeTokenBalance && (
              <div className="balance-loading">Loading...</div>
            )}
            {!isLoadingEvmNativeTokenBalance && evmNativeTokenBalance && (
              <div className="balance-amount">{evmNativeTokenBalance}</div>
            )}
            {/* TODO - price in USD */}
            <div className="balance-usd">$0.00 USD</div>
          </div>

          {/* Transactions Section - TODO */}
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
