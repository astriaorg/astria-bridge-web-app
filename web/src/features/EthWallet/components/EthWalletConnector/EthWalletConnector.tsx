import React from "react";

import { useEthWallet } from "../../hooks/useEthWallet";
import { getEvmChains } from "config/chainConfigs";

/**
 * A card component for connecting to an ethereum wallet
 */
export default function EthWalletConnector() {
  const { providers, selectedWallet, userAccount, handleConnect } =
    useEthWallet();

  const evmChains = getEvmChains();
  const firstKey = Object.keys(evmChains)[0];
  const defaultChain = evmChains[firstKey];

  return (
    <div className="card p-5 wallet-provider-card">
      <header className="card-header">
        <p className="card-header-title is-size-5 has-text-weight-normal has-text-light">
          Wallet Connector
        </p>
      </header>
      <div className="card-content p-4">
        <div className="mt-3">
          <div className="heading">Wallets Detected</div>
          <div>
            {providers.length > 0 ? (
              providers.map((provider) => (
                <button
                  type="button"
                  className="button is-tall"
                  key={provider.info.uuid}
                  onClick={() => handleConnect(provider, defaultChain)}
                >
                  <img src={provider.info.icon} alt={provider.info.name} />
                  <p>{provider.info.name}</p>
                </button>
              ))
            ) : (
              <div>No Announced Wallet Providers</div>
            )}
          </div>
        </div>
        <div className="mt-3">
          <div className="heading">
            {userAccount ? "" : "No "}Wallet Selected
          </div>
          {userAccount && (
            <div>
              <div>
                <img
                  className="wallet-provider-icon"
                  src={selectedWallet?.info.icon}
                  alt={selectedWallet?.info.name}
                />
                <div>{selectedWallet?.info.name}</div>
                <div>({userAccount.address})</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
