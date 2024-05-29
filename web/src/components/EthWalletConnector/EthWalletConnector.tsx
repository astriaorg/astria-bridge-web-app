import { useState } from "react";
import { useSyncWalletProviders } from "hooks/useSyncWalletProviders";

export default function EthWalletConnector() {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [userAccount, setUserAccount] = useState<string>("");
  const providers = useSyncWalletProviders();

  // connect to the selected provider using eth_requestAccounts.
  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      const accounts: unknown = await providerWithInfo.provider.request({
        method: "eth_requestAccounts",
      });

      setSelectedWallet(providerWithInfo);
      if (Array.isArray(accounts) && accounts.length > 0) {
        console.log(
          "Connected to",
          providerWithInfo.info.name,
          "with account",
          accounts[0],
        );
        setUserAccount(accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // display detected providers as connect buttons.
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
              providers?.map((provider: EIP6963ProviderDetail) => (
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
          <div className="heading">{userAccount ? "" : "No "}Wallet Selected</div>
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
