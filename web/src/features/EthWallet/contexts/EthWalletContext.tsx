import type React from "react";
import { createContext, type ReactNode, useState } from "react";
import { useSyncWalletProviders } from "../hooks/useSyncWalletProviders";
import type { UserAccount } from "../types";
import { formatBalance } from "utils";
import { ethers } from "ethers";

export interface EthWalletContextProps {
  providers: EIP6963ProviderDetail[];
  selectedWallet: EIP6963ProviderDetail | undefined;  // TODO - refactor to be an ethers.Provider to make things easier?
  userAccount: UserAccount | undefined;
  provider: ethers.BrowserProvider | undefined;
  signer: ethers.Signer | undefined;
  handleConnect: (providerWithInfo: EIP6963ProviderDetail) => Promise<void>;
}

export const EthWalletContext = createContext<
  EthWalletContextProps | undefined
>(undefined);

export const EthWalletContextProvider: React.FC<{ children: ReactNode }> = ({
                                                                              children,
                                                                            }) => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [selectedProvider, setSelectedProvider] = useState<ethers.BrowserProvider>();
  const [userAccount, setUserAccount] = useState<UserAccount>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const providers = useSyncWalletProviders();

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      setSelectedWallet(providerWithInfo);
      const accounts: unknown = await providerWithInfo.provider.request({
        method: "eth_requestAccounts",
      });
      if (Array.isArray(accounts) && accounts.length > 0) {
        // use first account
        const address = accounts[0];

        // create an ethers provider and signer
        const ethersProvider = new ethers.BrowserProvider(providerWithInfo.provider);
        setSelectedProvider(ethersProvider);
        const ethersSigner = await ethersProvider.getSigner();
        setSigner(ethersSigner);

        // get balance using ethers
        const balance = await ethersProvider.getBalance(address);
        const formattedBalance = formatBalance(balance.toString());
        const userAccount: UserAccount = {
          address: address,
          balance: formattedBalance,
        };
        setUserAccount(userAccount);

        console.log(
          "Connected to",
          providerWithInfo.info.name,
          "with account",
          address,
        );

      }
    } catch (error) {
      console.error("Failed to connect to wallet.", error);
    }
  };

  return (
    <EthWalletContext.Provider
      value={{
        providers,
        provider: selectedProvider,
        selectedWallet,
        userAccount,
        signer,
        handleConnect,
      }}
    >
      {children}
    </EthWalletContext.Provider>
  );
};
