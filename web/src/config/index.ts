import type { IbcChains } from "./chainConfigs";

/**
 * Represents the configuration object for the application.
 *
 * @typedef {Object} AppConfig
 * @property {IbcChains} ibcChains - The configuration for IBC chains.
 */
export type AppConfig = {
  ibcChains: IbcChains;
  sequencerBridgeAccount: string;
  evmWithdrawerContractAddress: string;
};
