import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CopyToClipboardButton from "components/CopyToClipboardButton/CopyToClipboardButton";

import { useCosmosWallet } from "../../hooks/useCosmosWallet";

interface ConnectCosmosWalletButtonProps {
  // Label to show before the user is connected to a wallet.
  labelBeforeConnected?: string;
}

/**
 * Button with information dropdown to connect to a Cosmos wallet.
 */
export default function ConnectCosmosWalletButton({
  labelBeforeConnected,
}: ConnectCosmosWalletButtonProps) {
  const {
    connectCosmosWallet,
    cosmosAccountAddress,
    cosmosBalance,
    disconnectCosmosWallet,
    isLoadingCosmosBalance,
  } = useCosmosWallet();

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
    if (cosmosAccountAddress) {
      return cosmosAccountAddress;
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, cosmosAccountAddress]);

  // connect to wallet or show information dropdown
  const handleConnectWallet = useCallback(() => {
    if (!cosmosAccountAddress) {
      connectCosmosWallet();
    }
    if (cosmosAccountAddress) {
      // if user is already connected, open information dropdown
      toggleDropdown();
    }
  }, [connectCosmosWallet, toggleDropdown, cosmosAccountAddress]);

  const handleDisconnectWallet = useCallback(() => {
    const disconnect = async () => {
      await disconnectCosmosWallet();
    };

    disconnect().then((_) => {});
  }, [disconnectCosmosWallet]);

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
      {isDropdownActive && cosmosAccountAddress && (
        <div className="dropdown-card card">
          {/* Top Row - Address and Actions */}
          <div className="dropdown-header">
            <div className="address-container">
              <span className="address">{cosmosAccountAddress}</span>
            </div>
            <div className="action-buttons">
              <CopyToClipboardButton textToCopy={cosmosAccountAddress} />
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
                onClick={handleDisconnectWallet}
              >
                <span>
                  <i className="fas fa-power-off" />
                </span>
              </button>
            </div>
          </div>

          {/* Balance Row */}
          <div className="balance-container">
            {isLoadingCosmosBalance && (
              <div className="balance-loading">Loading...</div>
            )}
            {!isLoadingCosmosBalance && cosmosBalance && (
              <div className="balance-amount">{cosmosBalance}</div>
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
