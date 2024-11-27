import type { ChainInfo } from "@keplr-wallet/types";
import type { Chain } from "@rainbow-me/rainbowkit";

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
  rpcUrls: string[];
  iconClass?: string;
  blockExplorerUrl?: string;
};

/**
 * Converts an EvmChainInfo object to a Chain object for use with RainbowKit.
 * @param evmChain
 */
export function evmChainToRainbowKitChain(evmChain: EvmChainInfo): Chain {
  const nativeCurrency = evmChain.currencies[0];
  const chain: Chain = {
    id: evmChain.chainId,
    name: evmChain.chainName,
    rpcUrls: {
      default: { http: evmChain.rpcUrls },
    },
    nativeCurrency: {
      name: nativeCurrency.coinDenom,
      symbol: nativeCurrency.coinDenom,
      decimals: nativeCurrency.coinDecimals,
    },
  };

  if (evmChain.blockExplorerUrl) {
    chain.blockExplorers = {
      default: {
        name: evmChain.chainName,
        url: evmChain.blockExplorerUrl,
      },
    };
  }

  return chain;
}

/**
 * Converts a map of EVM chains to an array of Chain objects for use with RainbowKit.
 * @param evmChains
 */
export function evmChainsToRainbowKitChains(
  evmChains: EvmChains,
): readonly [Chain, ...Chain[]] {
  if (!evmChains || Object.keys(evmChains).length === 0) {
    throw new Error("At least one chain must be provided");
  }
  return Object.values(evmChains).map((evmChain) =>
    evmChainToRainbowKitChain(evmChain),
  ) as [Chain, ...Chain[]];
}

/**
 * Represents information about a currency used in an EVM chain.
 */
export type EvmCurrency = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  // contract address if this is a ERC20 token
  erc20ContractAddress?: `0x${string}`;
  // contract address if this a native token
  nativeTokenWithdrawerContractAddress?: `0x${string}`;
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
