import type { ChainInfo } from "@keplr-wallet/types";

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
  // contract address if this is a ERC20 token
  erc20ContractAddress?: string;
  // contract address if this a native token
  nativeTokenWithdrawerContractAddress?: string;
  // fee needed to pay for the ibc withdrawal, 18 decimals
  ibcWithdrawalFeeWei: string;
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
