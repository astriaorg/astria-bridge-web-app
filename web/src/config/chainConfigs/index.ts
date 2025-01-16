import type { CosmosChains, EvmChainInfo, EvmChains } from "./types";

export enum FlameNetwork {
  LOCAL = "local",
  DUSK = "dusk",
  DAWN = "dawn",
  MAINNET = "mainnet",
}

export interface FlameNetworkConfig {
  name: FlameNetwork;
  evmChains: EvmChains;
  cosmosChains: CosmosChains;
}

export interface ChainConfigsObject {
  evmChains: EvmChains;
  cosmosChains: CosmosChains;
}

export type NetworkConfigs = Record<FlameNetwork, FlameNetworkConfig>;

import * as dawn from "./ChainConfigsDawn";
import * as dusk from "./ChainConfigsDusk";
import * as local from "./ChainConfigsLocal";
import * as mainnet from "./ChainConfigsMainnet";

const NETWORK_CONFIGS: NetworkConfigs = {
  [FlameNetwork.LOCAL]: {
    name: FlameNetwork.LOCAL,
    evmChains: local.evmChains,
    cosmosChains: local.cosmosChains,
  },
  [FlameNetwork.DUSK]: {
    name: FlameNetwork.DUSK,
    evmChains: dusk.evmChains,
    cosmosChains: dusk.cosmosChains,
  },
  [FlameNetwork.DAWN]: {
    name: FlameNetwork.DAWN,
    evmChains: dawn.evmChains,
    cosmosChains: dawn.cosmosChains,
  },
  [FlameNetwork.MAINNET]: {
    name: FlameNetwork.MAINNET,
    evmChains: mainnet.evmChains,
    cosmosChains: mainnet.cosmosChains,
  },
};

/**
 * Gets the chain ID for a Flame network.
 */
export function getFlameChainId(network: FlameNetwork): number {
  const config = NETWORK_CONFIGS[network];
  const evmChain = Object.values(config.evmChains)[0];
  if (!evmChain) {
    throw new Error(`No EVM chain found for network ${network}`);
  }
  return evmChain.chainId;
}

/**
 * Gets the Flame network for a chain ID.
 */
export function getFlameNetworkByChainId(chainId: number): FlameNetwork {
  const network = Object.entries(NETWORK_CONFIGS).find(([_, config]) => {
    const evmChain = Object.values(config.evmChains)[0];
    return evmChain && evmChain.chainId === chainId;
  });

  if (!network) {
    throw new Error(`No Flame network found for chain ID ${chainId}`);
  }

  return network[0] as FlameNetwork;
}

/**
 * Gets chain configurations for the specified network.
 * Falls back to local network config if specified network is not found.
 */
export function getChainConfigs(network: FlameNetwork): FlameNetworkConfig {
  return NETWORK_CONFIGS[network] || NETWORK_CONFIGS[FlameNetwork.LOCAL];
}

/**
 * Gets all chain configurations.
 * Returns merged configurations to maintain compatibility with existing code.
 */
export function getAllChainConfigs(): ChainConfigsObject {
  const evmChains: EvmChains = {};
  const cosmosChains: CosmosChains = {};

  for (const config of Object.values(NETWORK_CONFIGS)) {
    Object.assign(evmChains, config.evmChains);
    Object.assign(cosmosChains, config.cosmosChains);
  }

  return {
    evmChains,
    cosmosChains,
  };
}

/**
 * Gets EVM chain configuration by chain ID.
 */
export function getEvmChainByChainId(chainId: number): EvmChainInfo {
  const allChainConfigs = getAllChainConfigs();
  const found = Object.values(allChainConfigs.evmChains).find(
    (chainConfig) => chainConfig.chainId === chainId,
  );

  if (!found) {
    throw new Error(`Chain with chainId ${chainId} not found`);
  }
  return found;
}
