import {
  type EvmChainInfo,
  type EvmChains,
  type EvmCurrency,
  evmCurrencyBelongsToChain,
  type IbcChainInfo,
  type IbcChains,
  type IbcCurrency,
  ibcCurrencyBelongsToChain,
  toChainInfo,
} from "./chainConfigs/types";
import { ConfigContextProvider } from "./contexts/ConfigContext";
import { getEnvVariable } from "./env";
import { useConfig } from "./hooks/useConfig";

/**
 * Represents the configuration object for the application.
 *
 * @typedef {Object} AppConfig
 * @property {IbcChains} ibcChains - The configurations for IBC chains.
 * @property {EvmChains} evmChains - The configurations for EVM chains.
 * @property {string} brandURL - The URL for the brand link in the navbar.
 * @property {string} bridgeURL - The URL for the bridge link in the navbar.
 * @property {string} swapURL - The URL for the swap link in the navbar.
 * @property {string} poolURL - The URL for the pool link in the navbar.
 * @property {function} getEvmChainById - Retrieves the EVM chain with the given chain ID from the config context.
 */
export type AppConfig = {
  ibcChains: IbcChains;
  evmChains: EvmChains;
  brandURL: string;
  bridgeURL: string;
  swapURL: string;
  poolURL: string;
  feedbackFormURL: string;
  getEvmChainById(chainIdHex: string): EvmChainInfo;
};

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
  toChainInfo,
  useConfig,
};
