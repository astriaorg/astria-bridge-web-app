import { getIbcChains, type IbcChains } from "./chains";

/**
 * Represents the configuration object for the application.
 *
 * @typedef {Object} AppConfig
 * @property {IbcChains} ibcChains - The configuration for IBC chains.
 */
export type AppConfig = {
  ibcChains: IbcChains;
};

/**
 * Returns the application configuration.
 *
 * @return {AppConfig} The application configuration object.
 */
export function getAppConfig(): AppConfig {
  return {
    ibcChains: getIbcChains(),
  };
}
