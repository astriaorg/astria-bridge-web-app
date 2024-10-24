import React, { useMemo } from "react";

import type { AppConfig } from "config";
import {
  type EvmChainInfo,
  type EvmChains,
  getEvmChains,
  getIbcChains,
  type IbcChains,
} from "config/chainConfigs";
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
  const evmChains: EvmChains = useMemo(() => {
    return getEvmChains();
  }, []);
  const ibcChains: IbcChains = useMemo(() => {
    return getIbcChains();
  }, []);

  const brandURL = getEnvVariable("REACT_APP_BRAND_URL");
  const bridgeURL = getEnvVariable("REACT_APP_BRIDGE_URL");
  const swapURL = getEnvVariable("REACT_APP_SWAP_URL");
  const poolURL = getEnvVariable("REACT_APP_POOL_URL");

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
        getEvmChainById,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
