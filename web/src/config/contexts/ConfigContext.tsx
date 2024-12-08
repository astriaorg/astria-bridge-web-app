import React from "react";

import type { AppConfig } from "config";
import type { EvmChainInfo } from "config/chainConfigs/types";
import { getEnvChainConfigs } from "config/chainConfigs";
import { getEnvVariable } from "config/env";

export const ConfigContext = React.createContext<AppConfig | undefined>(
  undefined,
);

type ConfigContextProps = {
  children: React.ReactNode;
};

/**
 * ConfigContextProvider component to provide config context to children.
 * @param children
 */
export const ConfigContextProvider: React.FC<ConfigContextProps> = ({
  children,
}) => {
  const { evm: evmChains, ibc: ibcChains } = getEnvChainConfigs();
  const brandURL = getEnvVariable("REACT_APP_BRAND_URL");
  const bridgeURL = getEnvVariable("REACT_APP_BRIDGE_URL");
  const swapURL = getEnvVariable("REACT_APP_SWAP_URL");
  const poolURL = getEnvVariable("REACT_APP_POOL_URL");

  let feedbackFormURL: string;
  try {
    feedbackFormURL = getEnvVariable("REACT_APP_FEEDBACK_FORM_URL");
  } catch (e) {
    feedbackFormURL = brandURL;
  }

  // retrieves the EVM chain with the given chain ID.
  const getEvmChainById = (chainIdHex: string): EvmChainInfo => {
    const chainIdNum = Number.parseInt(chainIdHex, 16);
    for (const chain of Object.values(evmChains)) {
      if (chain.chainId === chainIdNum) {
        return chain;
      }
    }
    throw new Error(`Chain with ID ${chainIdHex} (${chainIdNum}) not found`);
  };

  return (
    <ConfigContext.Provider
      value={{
        ibcChains,
        evmChains,
        brandURL,
        bridgeURL,
        swapURL,
        poolURL,
        feedbackFormURL,
        getEvmChainById,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
