import type { ChainInfo } from "@keplr-wallet/types";
import { getEnvVariable } from "config";

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
import {
  evmChains as mainnetEvmChains,
  ibcChains as mainnetIbcChains,
} from "./ChainConfigsMainnet";

/**
 * Represents information about an IBC chain.
 * This type extends the base ChainInfo type from Keplr.
 */
export type IbcChainInfo = {
  iconClass?: string;
  currencies: IbcCurrency[];
} & ChainInfo;

/**
 * Converts an IbcChainInfo object to a ChainInfo object.
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
 */
export function ibcCurrencyBelongsToChain(
  currency: IbcCurrency,
  chain: IbcChainInfo,
): boolean {
  return chain.currencies?.includes(currency);
}

/**
 * Represents information about an EVM chain.
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
 */
export type EvmCurrency = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  erc20ContractAddress?: string;
  nativeTokenWithdrawerContractAddress?: string;
  iconClass?: string;
};

/**
 * Returns true if the given currency belongs to the given chain.
 */
export function evmCurrencyBelongsToChain(
  currency: EvmCurrency,
  chain: EvmChainInfo,
): boolean {
  return chain.currencies?.includes(currency);
}

// Map of environment labels to their chain configurations
// EvmChains type maps labels to EvmChainInfo objects
export type EvmChains = {
  [label: string]: EvmChainInfo;
};

// Map of environment labels to their chain configurations
const ENV_CHAIN_CONFIGS = {
  local: { evm: localEvmChains, ibc: localIbcChains },
  dusk: { evm: duskEvmChains, ibc: duskIbcChains },
  dawn: { evm: dawnEvmChains, ibc: dawnIbcChains },
  mainnet: { evm: mainnetEvmChains, ibc: mainnetIbcChains },
} as const;

type Environment = keyof typeof ENV_CHAIN_CONFIGS;

/**
 * Gets the chain configurations for the current environment.
 * If the chain configurations are overridden by environment variables,
 * those will be used instead.
 */
export function getEnvChainConfigs() {
  // get environment-specific configs as base
  const env = getEnvVariable("REACT_APP_ENV").toLowerCase() as Environment;
  const baseConfig = ENV_CHAIN_CONFIGS[env] || ENV_CHAIN_CONFIGS.local;

  // copy baseConfig to result
  const result = { ...baseConfig };

  // try to get IBC chains override
  try {
    const ibcChainsOverride = getEnvVariable("REACT_APP_IBC_CHAINS");
    if (ibcChainsOverride) {
      result.ibc = JSON.parse(ibcChainsOverride);
      console.debug("Using IBC chains override from environment");
    }
  } catch (e) {
    console.debug("No valid IBC chains override found, using default");
  }

  // try to get EVM chains override
  try {
    const evmChainsOverride = getEnvVariable("REACT_APP_EVM_CHAINS");
    if (evmChainsOverride) {
      result.evm = JSON.parse(evmChainsOverride);
      console.debug("Using EVM chains override from environment");
    }
  } catch (e) {
    console.debug("No valid EVM chains override found, using default");
  }

  return result;
}
