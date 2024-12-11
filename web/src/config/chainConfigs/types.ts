import type {
  Asset,
  AssetList,
  Chain as CosmosChain,
  DenomUnit,
} from "@chain-registry/types";
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

/**
 * Returns the chain name from the chain ID.
 */
export function cosmosChainNameFromId(chainId: string) {
  return chainId.split("-")[0];
}

/**
 * Converts an IbcChainInfo object to a CosmosChain object for use with CosmosKit.
 */
function ibcChainInfoToCosmosChain(chain: IbcChainInfo): CosmosChain {
  return {
    ...chain,
    chain_name: cosmosChainNameFromId(chain.chainId),
    chain_id: chain.chainId,
    chain_type: "cosmos",
  };
}

/**
 * Converts a map of IBC chains to an array of CosmosChain objects for use with CosmosKit.
 */
export function ibcChainInfosToCosmosChains(
  ibcChains: IbcChains,
): [CosmosChain, ...CosmosChain[]] {
  if (!ibcChains || Object.keys(ibcChains).length === 0) {
    throw new Error("At least one chain must be provided");
  }
  return Object.values(ibcChains).map((ibcChain) =>
    ibcChainInfoToCosmosChain(ibcChain),
  ) as [CosmosChain, ...CosmosChain[]];
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
 * Converts a map of IBC chains to an array of AssetList objects for use with CosmosKit.
 */
export function ibcChainInfosToCosmosKitAssetLists(
  ibcChains: IbcChains,
): AssetList[] {
  return Object.values(ibcChains).map((chain) => {
    return ibcCurrenciesToCosmosKitAssetList(
      cosmosChainNameFromId(chain.chainId),
      chain.currencies,
    );
  });
}

/**
 * Converts a list of IBC currencies to an AssetList object for use with CosmosKit.
 */
export function ibcCurrenciesToCosmosKitAssetList(
  chainName: string,
  currencies: IbcCurrency[],
): AssetList {
  return {
    chain_name: chainName,
    assets: currencies.map((currency, index) => {
      const isNativeAsset = index === 0;
      return ibcCurrencyToCosmosKitAsset(currency, isNativeAsset);
    }),
  };
}

/**
 * Converts an IbcCurrency object to an Asset object for use with CosmosKit.
 */
function ibcCurrencyToCosmosKitAsset(
  currency: IbcCurrency,
  isNativeAsset = false,
): Asset {
  // create denomination units - one for the base denom and one for the display denom
  const denomUnits: DenomUnit[] = [
    {
      denom: currency.coinMinimalDenom,
      exponent: 0,
    },
    {
      denom: currency.coinDenom,
      exponent: currency.coinDecimals,
    },
  ];

  // sdk.coin for native assets, ics20 for IBC tokens
  const typeAsset = isNativeAsset ? "sdk.coin" : "ics20";
  const asset: Asset = {
    denom_units: denomUnits,
    type_asset: typeAsset,
    base: currency.coinMinimalDenom,
    name: currency.coinDenom,
    display: currency.coinDenom,
    symbol: currency.coinDenom,
  };

  // add IBC info if channel exists
  // TODO - where is this used by cosmoskit?
  if (currency.ibcChannel) {
    asset.ibc = {
      source_channel: currency.ibcChannel,
      dst_channel: "", // TODO
      source_denom: currency.coinMinimalDenom,
    };
  }

  return asset;
}

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
