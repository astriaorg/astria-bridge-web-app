import { useContext } from "react";

import { EvmWalletContext } from "../contexts/EvmWalletContext";

export const useEvmWallet = () => {
  const context = useContext(EvmWalletContext);
  if (!context) {
    throw new Error("useEvmWallet must be used within EvmWalletProvider");
  }
  return context;
};
