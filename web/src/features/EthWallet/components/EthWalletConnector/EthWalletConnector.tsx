import React from "react";
import { useEthWallet } from "../../hooks/useEthWallet";

export default function EthWalletConnector() {
  const { providers, selectedWallet, userAccount, handleConnect } =
    useEthWallet();

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
                  onClick={() => handleConnect(provider)}
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
                <div>({userAccount})</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
