import type React from "react";
import { createContext, type ReactNode, useState } from "react";
import { useSyncWalletProviders } from "../hooks/useSyncWalletProviders";
import type { UserAccount } from "../types";
import { formatBalance } from "utils";
import { ethers } from "ethers";
import { EvmChainInfo, getEvmChainById } from "config/chainConfigs";

export interface EthWalletContextProps {
  providers: EIP6963ProviderDetail[];
  selectedWallet: EIP6963ProviderDetail | undefined; // TODO - refactor to be an ethers.Provider to make things easier?
  userAccount: UserAccount | undefined;
  selectedChain: EvmChainInfo | undefined;
  provider: ethers.BrowserProvider | undefined;
  signer: ethers.Signer | undefined;
  handleConnect: (providerWithInfo: EIP6963ProviderDetail, defaultChain: EvmChainInfo) => Promise<void>;
}

export const EthWalletContext = createContext<
  EthWalletContextProps | undefined
>(undefined);

export const EthWalletContextProvider: React.FC<{ children: ReactNode }> = ({
                                                                              children,
                                                                            }) => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [selectedProvider, setSelectedProvider] =
    useState<ethers.BrowserProvider>();
  const [userAccount, setUserAccount] = useState<UserAccount>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const providers = useSyncWalletProviders();
  const [selectedChain, setSelectedChain] = useState<EvmChainInfo | undefined>();


  // get chain id from provider
  const getChainId = async (providerWithInfo: EIP6963ProviderDetail): Promise<string | undefined> => {
    try {
      const chainIdHex: unknown = await providerWithInfo.provider.request({
        method: "eth_chainId",
      });
      return chainIdHex as string;
    } catch (error) {
      console.warn("Failed to get chain", error);
      return undefined;
    }
  };

  // switch to a different chain
  const switchToChain = async (providerWithInfo: EIP6963ProviderDetail, chainId: string): Promise<boolean> => {
    try {
      await providerWithInfo.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      return true;
    } catch (error) {
      console.warn("Failed to switch chain", error);
      return false;
    }
  };

  // add a chain to wallet
  const addChain = async (providerWithInfo: EIP6963ProviderDetail, defaultChain: EvmChainInfo): Promise<void> => {
    try {
      await providerWithInfo.provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${defaultChain.chainId.toString(16)}`,
          chainName: defaultChain.chainName,
          nativeCurrency: {
            name: defaultChain.currencies[0].coinDenom,
            symbol: defaultChain.currencies[0].coinDenom,
            decimals: defaultChain.currencies[0].coinDecimals,
          },
          rpcUrls: defaultChain.rpcUrls,
        }],
      });
    } catch (error) {
      console.warn("Failed to add chain", error);
    }
  };

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail, defaultChain: EvmChainInfo) => {
    const chainIdHex = await getChainId(providerWithInfo);

    if (chainIdHex) {
      try {
        const chain = getEvmChainById(chainIdHex);
        setSelectedChain(chain);
      } catch (error) {
        console.warn("Error in getEvmChainById", error);

        // try to switch chains if getEvmChainById fails
        const chainId = `0x${defaultChain.chainId.toString(16)}`;
        const switched = await switchToChain(providerWithInfo, chainId);

        if (!switched) {
          await addChain(providerWithInfo, defaultChain);
        }
      }
    } else {
      const chainId = `0x${defaultChain.chainId.toString(16)}`;
      const switched = await switchToChain(providerWithInfo, chainId);

      if (!switched) {
        await addChain(providerWithInfo, defaultChain);
      }
    }

    try {
      setSelectedWallet(providerWithInfo);
      const accounts: unknown = await providerWithInfo.provider.request({
        method: "eth_requestAccounts",
      });
      if (Array.isArray(accounts) && accounts.length > 0) {
        // use first account
        const address = accounts[0];

        // create an ethers provider and signer
        const ethersProvider = new ethers.BrowserProvider(
          providerWithInfo.provider,
        );
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
        selectedChain,
        signer,
        handleConnect,
      }}
    >
      {children}
    </EthWalletContext.Provider>
  );
};
