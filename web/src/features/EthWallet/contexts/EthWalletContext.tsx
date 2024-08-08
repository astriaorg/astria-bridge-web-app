import type React from "react";
import { createContext, type ReactNode, useState } from "react";
import { useSyncWalletProviders } from "../hooks/useSyncWalletProviders";
import { UserAccount } from "../types";
import {formatBalance} from "utils";

export interface EthWalletContextProps {
  providers: EIP6963ProviderDetail[];
  selectedWallet: EIP6963ProviderDetail | undefined;
  userAccount: UserAccount | undefined;
  handleConnect: (providerWithInfo: EIP6963ProviderDetail) => Promise<void>;
}

export const EthWalletContext = createContext<
  EthWalletContextProps | undefined
>(undefined);

export const EthWalletContextProvider: React.FC<{ children: ReactNode }> = ({
                                                                              children,
                                                                            }) => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [userAccount, setUserAccount] = useState<UserAccount>();
  const providers = useSyncWalletProviders();

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      setSelectedWallet(providerWithInfo);
      const accounts: unknown = await providerWithInfo.provider.request({
        method: "eth_requestAccounts",
      });
      if (Array.isArray(accounts) && accounts.length > 0) {
        const address = accounts[0];
        console.log("accounts", accounts);
        let balance: unknown = await providerWithInfo.provider.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        // const balanceInEth = BigNumber.from(balance).div(BigNumber.from(10).pow(18)).toString();
        // wei to eth
        let balAsInt: bigint = BigInt(balance as number);
        let formattedBalance = formatBalance(balAsInt.toString());

        console.log("balanceInEth", formattedBalance);
        console.log(
          "Connected to",
          providerWithInfo.info.name,
          "with account",
          address,
        );
        const userAccount: UserAccount = {
          address: address,
          balance: formattedBalance,
        };

        setUserAccount(userAccount);
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
