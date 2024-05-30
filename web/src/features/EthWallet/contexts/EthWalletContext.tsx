import React, { createContext, ReactNode, useState } from "react";
import { useSyncWalletProviders } from "../hooks/useSyncWalletProviders";

export interface EIP6963ProviderDetail {
  provider: any;
  info: {
    name: string;
    icon: string;
    uuid: string;
  };
}

export interface EthWalletContextProps {
  providers: EIP6963ProviderDetail[];
  selectedWallet: EIP6963ProviderDetail | undefined;
  userAccount: string;
  handleConnect: (providerWithInfo: EIP6963ProviderDetail) => Promise<void>;
}

export const EthWalletContext = createContext<
  EthWalletContextProps | undefined
>(undefined);

export const EthWalletContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [userAccount, setUserAccount] = useState<string>("");
  const providers = useSyncWalletProviders();

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

  return (
    <EthWalletContext.Provider
      value={{ providers, selectedWallet, userAccount, handleConnect }}
    >
      {children}
    </EthWalletContext.Provider>
  );
};
