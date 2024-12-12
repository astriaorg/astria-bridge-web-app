import type {
  Asset,
  AssetList,
  Chain as CosmosKitChain,
  DenomUnit,
} from "@chain-registry/types";
import type { Chain } from "@rainbow-me/rainbowkit";

// FIXME - i manually recreated types from keplr here as a stop gap.
//  this will get refactored further when i update the config logic
//  to support network switching

export interface Bech32Config {
  readonly bech32PrefixAccAddr: string;
  readonly bech32PrefixAccPub: string;
  readonly bech32PrefixValAddr: string;
  readonly bech32PrefixValPub: string;
  readonly bech32PrefixConsAddr: string;
  readonly bech32PrefixConsPub: string;
}

export interface BIP44 {
  readonly coinType: number;
}

/**
 * Represents information about a chain.
 */
export interface CosmosChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly stakeCurrency?: CosmosCurrency;
  readonly walletUrl?: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config?: Bech32Config;

  readonly currencies: IbcCurrency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: FeeCurrency[];

  // The icon to use for this chain in the ui
  readonly iconClass?: string;
}

/**
 * Returns the chain name from the chain ID.
 */
export function cosmosChainNameFromId(chainId: string) {
  return chainId.split("-")[0];
}

/**
 * Converts an CosmosChainInfo object to a CosmosChain object for use with CosmosKit.
 */
function cosmosChainInfoToCosmosKitChain(
  chain: CosmosChainInfo,
): CosmosKitChain {
  return {
    // TODO - add more fields from CosmosChain?
    ...chain,
    chain_name: cosmosChainNameFromId(chain.chainId),
    pretty_name: chain.chainName,
    chain_id: chain.chainId,
    chain_type: "cosmos",
    bech32_prefix: chain.bech32Config?.bech32PrefixAccAddr,
    apis: {
      rpc: [
        {
          address: chain.rpc,
        },
      ],
      rest: [
        {
          address: chain.rest,
        },
      ],
    },
  };
}

/**
 * Converts a map of IBC chains to an array of CosmosChain objects for use with CosmosKit.
 */
export function cosmosChainInfosToCosmosKitChains(
  cosmosChains: CosmosChains,
): [CosmosKitChain, ...CosmosKitChain[]] {
  if (!cosmosChains || Object.keys(cosmosChains).length === 0) {
    throw new Error("At least one chain must be provided");
  }
  return Object.values(cosmosChains).map((cosmosChain) =>
    cosmosChainInfoToCosmosKitChain(cosmosChain),
  ) as [CosmosKitChain, ...CosmosKitChain[]];
}

// CosmosChains type maps labels to CosmosChainInfo objects
export type CosmosChains = {
  [label: string]: CosmosChainInfo;
};

// Adds gas price step to a type
export type WithGasPriceStep<T> = T & {
  readonly gasPriceStep?: {
    readonly low: number;
    readonly average: number;
    readonly high: number;
  };
};

// Represents information about a currency.
export interface CosmosCurrency {
  readonly coinDenom: string;
  readonly coinMinimalDenom: string;
  readonly coinDecimals: number;
  /**
   * This is used to fetch asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  readonly coinGeckoId?: string;
  readonly coinImageUrl?: string;
}

// Represents information about a currency used for fees.
export type FeeCurrency = WithGasPriceStep<CosmosCurrency>;

/**
 * Represents information about a currency that uses IBC.
 */
export interface IbcCurrency extends CosmosCurrency {
  // The ibc channel used to send this currency
  ibcChannel?: string;
  // The sequencer bridge account used to bridge this currency to the evm
  sequencerBridgeAccount?: string;
  // The icon to use for this currency in the ui
  iconClass?: string;
}

/**
 * Converts a map of IBC chains to an array of AssetList objects for use with CosmosKit.
 */
export function cosmosChainInfosToCosmosKitAssetLists(
  cosmosChains: CosmosChains,
): AssetList[] {
  return Object.values(cosmosChains).map((chain) => {
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
  chain: CosmosChainInfo,
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
