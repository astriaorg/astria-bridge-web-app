import type { ChainInfo } from "@keplr-wallet/types";
import { getEnvVariable } from "config/env";
import { ibcChains as localIbcChains } from "./local";
import { ibcChains as duskIbcChains } from "./dusk";

/**
 * Represents information about an IBC (Inter-Blockchain Communication) chain.
 * This class extends the base class ChainInfo.
 *
 * @typedef {object} IbcChainInfo
 * @property {string} ibcChannel - The name of the IBC channel for this chain.
 * @property {string} iconSourceUrl - The URL to the source of the chain's icon.
 * @extends {ChainInfo}
 */
export type IbcChainInfo = {
  ibcChannel: string;
  iconSourceUrl: string;
} & ChainInfo;

// IbcChains type maps labels to IbcChainInfo objects
export type IbcChains = {
  [label: string]: IbcChainInfo;
};

/**
 * Retrieves the IBC chains from the environment variable override or the default chain configurations,
 * depending on the environment.
 *
 * @returns {IbcChains} - The IBC chains configuration.
 */
export function getIbcChains(): IbcChains {
  // try to get the IBC chains from the environment variable override first
  try {
    const ibcChains = getEnvVariable("REACT_APP_IBC_CHAINS");
    if (ibcChains) {
      // TODO - validate the JSON against type
      return JSON.parse(ibcChains);
    }
  } catch (e) {
    console.log("REACT_APP_IBC_CHAINS not set. Continuing...");
  }

  // get default chain configs based on REACT_APP_ENV
  if (getEnvVariable("REACT_APP_ENV") === "dusk") {
    return duskIbcChains;
  }
  return localIbcChains;
}
