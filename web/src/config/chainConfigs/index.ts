"use client";

import type { CosmosChains, EvmChainInfo, EvmChains } from "./types";

export enum FlameNetwork {
  LOCAL = "local",
  DUSK = "dusk",
  DAWN = "dawn",
  MAINNET = "mainnet",
}

export interface ChainConfigs {
  evmChains: EvmChains;
  cosmosChains: CosmosChains;
}

import * as dawn from "./ChainConfigsDawn";
import * as dusk from "./ChainConfigsDusk";
import * as local from "./ChainConfigsLocal";
import * as mainnet from "./ChainConfigsMainnet";

const NETWORK_CONFIGS: Record<FlameNetwork, ChainConfigs> = {
  [FlameNetwork.LOCAL]: local,
  [FlameNetwork.DUSK]: dusk,
  [FlameNetwork.DAWN]: dawn,
  [FlameNetwork.MAINNET]: mainnet,
};

/**
 * Gets chain configurations for the specified network.
 * Falls back to local network config if specified network is not found.
 */
export function getChainConfigs(network: FlameNetwork): ChainConfigs {
  return NETWORK_CONFIGS[network] || NETWORK_CONFIGS[FlameNetwork.LOCAL];
}

/**
 * Gets all chain configurations.
 * This was needed to instantiate the cosmoskit and rainbowkit configs to support s
 */
export function getAllChainConfigs(): ChainConfigs {
  return {
    evmChains: {
      ...local.evmChains,
      ...dusk.evmChains,
      ...dawn.evmChains,
      ...mainnet.evmChains,
    },
    cosmosChains: {
      ...local.cosmosChains,
      ...dusk.cosmosChains,
      ...dawn.cosmosChains,
      ...mainnet.cosmosChains,
    },
  };
}

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
