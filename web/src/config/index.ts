import type { EvmChains, IbcChains } from "./chainConfigs";

/**
 * Represents the configuration object for the application.
 *
 * @typedef {Object} AppConfig
 * @property {IbcChains} ibcChains - The configuration for IBC chains.
 * @property {EvmChains} evmChains - The configuration for EVM chains.
 */
export type AppConfig = {
  ibcChains: IbcChains;
  evmChains: EvmChains;
};
