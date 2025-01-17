import React from "react";

import { FlameNetwork, getChainConfigs } from "../chainConfigs";
import { getEnvVariable } from "../env";
import type { AppConfig, CosmosChains, EvmChains } from "../index";

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

  // default to Mainnet
  // TODO - remember in localStorage?
  const [selectedFlameNetwork, setSelectedFlameNetwork] =
    React.useState<FlameNetwork>(FlameNetwork.MAINNET);

  const { evmChains: evm, cosmosChains: cosmos } =
    getChainConfigs(selectedFlameNetwork);
  const [evmChains, setEvmChains] = React.useState<EvmChains>(evm);
  const [cosmosChains, setCosmosChains] = React.useState<CosmosChains>(cosmos);

  const networksList = (
    process.env.REACT_APP_NETWORK_LIST_OPTIONS || "dusk,mainnet"
  ).split(",") as FlameNetwork[];

  // update evm and cosmos chains when the network is changed
  const selectFlameNetwork = (network: FlameNetwork) => {
    const { evmChains, cosmosChains } = getChainConfigs(network);
    setEvmChains(evmChains);
    setCosmosChains(cosmosChains);
    setSelectedFlameNetwork(network);
  };

  return (
    <ConfigContext.Provider
      value={{
        cosmosChains,
        evmChains,
        selectedFlameNetwork,
        selectFlameNetwork,
        brandURL,
        bridgeURL,
        swapURL,
        poolURL,
        feedbackFormURL,
        networksList,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
