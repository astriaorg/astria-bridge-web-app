import React from "react";

import { getEnvChainConfigs } from "../chainConfigs";
import { getEnvVariable } from "../env";
import type { AppConfig } from "../index";

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
  const { evm: evmChains, cosmos: cosmosChains } = getEnvChainConfigs();
  const brandURL = getEnvVariable("REACT_APP_BRAND_URL");
  const bridgeURL = getEnvVariable("REACT_APP_BRIDGE_URL");
  const swapURL = getEnvVariable("REACT_APP_SWAP_URL");
  const poolURL = getEnvVariable("REACT_APP_POOL_URL");

  let feedbackFormURL: string | null;
  try {
    feedbackFormURL = getEnvVariable("REACT_APP_FEEDBACK_FORM_URL");
  } catch (e) {
    feedbackFormURL = null;
  }

  return (
    <ConfigContext.Provider
      value={{
        cosmosChains,
        evmChains,
        brandURL,
        bridgeURL,
        swapURL,
        poolURL,
        feedbackFormURL,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
