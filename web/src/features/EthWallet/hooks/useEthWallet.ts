import { useContext } from "react";

import {
  EthWalletContext,
  type EthWalletContextProps,
} from "../contexts/EthWalletContext";

// hook to make EthWalletContext easier to access
export const useEthWallet = (): EthWalletContextProps => {
  const context = useContext(EthWalletContext);
  if (!context) {
    throw new Error("useEthWallet must be used within an EthWalletProvider");
  }
  return context;
};
