import React from "react";

import { useConfig } from "config";

import { useEthWallet } from "features/EthWallet/hooks/useEthWallet";

/**
 * A card component for connecting to an ethereum wallet
 */
export default function EthWalletConnector() {
  const { providers, selectedWallet, userAccount, handleConnect } =
    useEthWallet();

  const { evmChains } = useConfig();
  const firstKey = Object.keys(evmChains)[0];
  const defaultChain = evmChains[firstKey];

  return (
    <div className="card p-0 wallet-provider-card">
      <div className="card-content p-0">
        <div className="heading">Wallets Detected</div>
        <div>
          {providers.length > 0 ? (
            providers.map((provider) => (
              <button
                type="button"
                className="button is-tall mt-2"
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
