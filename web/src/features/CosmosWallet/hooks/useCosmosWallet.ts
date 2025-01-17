import { useContext } from "react";

import { CosmosWalletContext } from "../contexts/CosmosWalletContext";

export const useCosmosWallet = () => {
  const context = useContext(CosmosWalletContext);
  if (!context) {
    throw new Error("useCosmosWallet must be used within CosmosWalletProvider");
  }
  return context;
};
