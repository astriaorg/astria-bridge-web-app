import type { ChainInfo } from "@keplr-wallet/types";
import { getEnvVariable } from "config/env";

import {
  evmChains as localEvmChains,
  ibcChains as localIbcChains,
} from "./ChainConfigsLocal";
import {
  evmChains as duskEvmChains,
  ibcChains as duskIbcChains,
} from "./ChainConfigsDusk";
import {
  evmChains as dawnEvmChains,
  ibcChains as dawnIbcChains,
} from "./ChainConfigsDawn";

/**
 * Represents information about an IBC (Inter-Blockchain Communication) chain.
 * This class extends the base class ChainInfo.
 *
 * @typedef {object} IbcChainInfo
 * @property {string} iconClass - The classname to use for the chain's icon.
 * @extends {ChainInfo}
 */
export type IbcChainInfo = {
  iconClass?: string;
  currencies: IbcCurrency[];
} & ChainInfo;

/**
 * Converts an IbcChainInfo object to a ChainInfo object.
 * @param chain
 */
export function toChainInfo(chain: IbcChainInfo): ChainInfo {
  const { iconClass, ...chainInfo } = chain;
  return chainInfo as ChainInfo;
}

// IbcChains type maps labels to IbcChainInfo objects
export type IbcChains = {
  [label: string]: IbcChainInfo;
};

/**
 * Represents information about a currency used in an IBC chain.
 *
 * @typedef {object} IbcCurrency
 * @property {string} coinDenom - The coin denomination to display to the user.
 * @property {string} coinMinimalDenom - The actual denomination used by the blockchain.
 * @property {number} coinDecimals - The number of decimal points to convert the minimal denomination to the user-facing denomination.
 * @property {string} ibcChannel - The IBC channel to use for this currency.
 * @property {string} sequencerBridgeAccount - The account on the sequencer chain that bridges tokens to the EVM chain.
 * @property {string} iconClass - The classname to use for the currency's icon.
 */
export type IbcCurrency = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  ibcChannel?: string;
  sequencerBridgeAccount?: string;
  iconClass?: string;
};

/**
 * Returns true if the given currency belongs to the given chain.
 * @param {IbcCurrency} currency - The currency to check.
 * @param {IbcChainInfo} chain - The chain to check.
 */
export function ibcCurrencyBelongsToChain(
  currency: IbcCurrency,
  chain: IbcChainInfo,
): boolean {
  // FIXME - what if two chains have currencies with the same coinDenom?
  //   e.g. USDC on Noble and USDC on Celestia
  return chain.currencies?.includes(currency);
}

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
    console.debug("REACT_APP_IBC_CHAINS not set. Continuing...");
  }

  // get default chain configs based on REACT_APP_ENV
  if (getEnvVariable("REACT_APP_ENV") === "dusk") {
    return duskIbcChains;
  }
  if (getEnvVariable("REACT_APP_ENV") === "dawn") {
    return dawnIbcChains;
  }
  return localIbcChains;
}

/**
 * Represents information about an EVM chain.
 *
 * @typedef {object} EvmChainInfo
 * @property {number} chainId - The decimal representation of the EVM chain ID.
 * @property {string} chainName - The name of the EVM chain to be displayed to the user.
 * @property {EvmCurrency[]} currencies - The currencies used in the chain.
 * @property {string} rpcUrls - The RPC URLs of the EVM chain.
 * @property {string} iconClass - The classname to use for the chain's icon.
 */
export type EvmChainInfo = {
  chainId: number;
  chainName: string;
  currencies: EvmCurrency[];
  rpcUrls?: string[];
  iconClass?: string;
};

/**
 * Represents information about a currency used in an EVM chain.
 *
 * @typedef {object} EvmCurrency
 * @property {string} coinDenom - The coin denomination to display to the user.
 * @property {string} coinMinimalDenom - The actual denomination used by the blockchain.
 * @property {number} coinDecimals - The number of decimal points to convert the minimal denomination to the user-facing denomination.
 * @property {string} erc20ContractAddress - The address of the contract of an ERC20 token.
 * @property {string} nativeTokenWithdrawerContractAddress - The address of the contract used to withdraw tokens from the EVM chain.
 * @property {string} iconClass - The classname to use for the currency's icon.
 */
export type EvmCurrency = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  erc20ContractAddress?: string;
  nativeTokenWithdrawerContractAddress?: string;
  iconClass?: string;
};

export function evmCurrencyBelongsToChain(
  currency: EvmCurrency,
  chain: EvmChainInfo,
): boolean {
  // FIXME - what if two chains have currencies with the same coinDenom?
  //   e.g. USDC on Noble and USDC on Celestia
  return chain.currencies?.includes(currency);
}

// EvmChains type maps labels to EvmChainInfo objects
export type EvmChains = {
  [label: string]: EvmChainInfo;
};

/**
 * Retrieves the EVM chain with the given chain ID.
 *
 * @param chainIdHex - The chain ID as a hexadecimal string.
 */
export function getEvmChainById(chainIdHex: string): EvmChainInfo {
  const chainId = Number.parseInt(chainIdHex as string, 16);
  const chains = getEvmChains();
  for (const chain of Object.values(chains)) {
    if (chain.chainId === chainId) {
      return chain;
    }
  }
  throw new Error(`Chain with ID ${chainId} (hex: ${chainIdHex}) not found`);
}

/**
 * Retrieves the EVM chains from the environment variable override or the default chain configurations,
 * depending on the environment.
 *
 * @returns {EvmChains} - The EVM chains configuration.
 */
export function getEvmChains(): EvmChains {
  // try to get the EVM chains from the environment variable override first
  try {
    const evmChains = getEnvVariable("REACT_APP_EVM_CHAINS");
    if (evmChains) {
      // TODO - validate the JSON against type
      return JSON.parse(evmChains);
    }
  } catch (e) {
    console.debug("REACT_APP_EVM_CHAINS not set. Continuing...");
  }

  // get default chain configs based on REACT_APP_ENV
  if (getEnvVariable("REACT_APP_ENV") === "dusk") {
    return duskEvmChains;
  }
  if (getEnvVariable("REACT_APP_ENV") === "dawn") {
    return dawnEvmChains;
  }
  return localEvmChains;
}
