import type { CosmosChains, EvmChainInfo, EvmChains } from "config";

export enum FlameNetwork {
  LOCAL = "local",
  DUSK = "dusk",
  DAWN = "dawn",
  MAINNET = "mainnet",
}

export interface ChainConfigs {
  evm: EvmChains;
  cosmos: CosmosChains;
}

import * as local from "./ChainConfigsLocal";
import * as dusk from "./ChainConfigsDusk";
import * as dawn from "./ChainConfigsDawn";
import * as mainnet from "./ChainConfigsMainnet";

const NETWORK_CONFIGS: Record<FlameNetwork, ChainConfigs> = {
  [FlameNetwork.LOCAL]: {
    evm: local.evmChains,
    cosmos: local.cosmosChains,
  },
  [FlameNetwork.DUSK]: {
    evm: dusk.evmChains,
    cosmos: dusk.cosmosChains,
  },
  [FlameNetwork.DAWN]: {
    evm: dawn.evmChains,
    cosmos: dawn.cosmosChains,
  },
  [FlameNetwork.MAINNET]: {
    evm: mainnet.evmChains,
    cosmos: mainnet.cosmosChains,
  },
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
  const showLocalNetwork = process.env.REACT_APP_SHOW_LOCAL_NETWORK === "true";
  return {
    evm: {
      ...local.evmChains,
      ...dusk.evmChains,
      ...dawn.evmChains,
      ...mainnet.evmChains,
    },
    cosmos: {
      ...local.cosmosChains,
      ...dusk.cosmosChains,
      ...dawn.cosmosChains,
      ...mainnet.cosmosChains,
    },
  };
}

export function getEvmChainByChainId(chainId: number): EvmChainInfo {
  const allChainConfigs = getAllChainConfigs();
  const found = Object.values(allChainConfigs.evm).find((chainConfig) => chainConfig.chainId === chainId);
  if (!found) {
    throw new Error(`Chain with chainId ${chainId} not found`);
  }
  return found;
}
