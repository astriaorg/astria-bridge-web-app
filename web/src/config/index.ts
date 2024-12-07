import {
  type EvmChainInfo,
  type EvmChains,
  evmChainsToRainbowKitChains,
  type EvmCurrency,
  evmCurrencyBelongsToChain,
  type IbcChainInfo,
  ibcChainInfosToCosmosChains,
  type IbcChains,
  type IbcCurrency,
  ibcCurrencyBelongsToChain,
  toChainInfo,
  cosmosChainNameFromId,
} from "./chainConfigs/types";
import { ConfigContextProvider } from "./contexts/ConfigContext";
import { getEnvVariable } from "./env";
import { useConfig } from "./hooks/useConfig";

/**
 * Represents the configuration object for the application.
 */
export interface AppConfig {
  // The configurations for IBC chains.
  ibcChains: IbcChains;
  // The configurations for EVM chains.
  evmChains: EvmChains;
  // The URL for the brand link in the navbar.
  brandURL: string;
  // The URL for the bridge link in the navbar.
  bridgeURL: string;
  // The URL for the swap link in the navbar.
  swapURL: string;
  // The URL for the pool link in the navbar.
  poolURL: string;
  // The URL for the feedback form side tag. Hides side tag when null.
  feedbackFormURL: string | null;
}

export {
  ConfigContextProvider,
  type EvmChainInfo,
  type EvmChains,
  type EvmCurrency,
  evmCurrencyBelongsToChain,
  getEnvVariable,
  type IbcChainInfo,
  type IbcChains,
  type IbcCurrency,
  ibcCurrencyBelongsToChain,
  ibcChainInfosToCosmosChains,
  toChainInfo,
  cosmosChainNameFromId,
  evmChainsToRainbowKitChains,
  useConfig,
};
