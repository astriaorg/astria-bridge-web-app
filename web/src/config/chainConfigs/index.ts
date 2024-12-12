import { type CosmosChains, type EvmChains, getEnvVariable } from "config";

import {
  cosmosChains as dawnCosmosChains,
  evmChains as dawnEvmChains,
} from "./ChainConfigsDawn";
import {
  cosmosChains as duskCosmosChains,
  evmChains as duskEvmChains,
} from "./ChainConfigsDusk";
import {
  cosmosChains as localCosmosChains,
  evmChains as localEvmChains,
} from "./ChainConfigsLocal";
import {
  cosmosChains as mainnetCosmosChains,
  evmChains as mainnetEvmChains,
} from "./ChainConfigsMainnet";

// Map of environment labels to their chain configurations
const ENV_CHAIN_CONFIGS = {
  local: { evm: localEvmChains, cosmos: localCosmosChains },
  dusk: { evm: duskEvmChains, cosmos: duskCosmosChains },
  dawn: { evm: dawnEvmChains, cosmos: dawnCosmosChains },
  mainnet: { evm: mainnetEvmChains, cosmos: mainnetCosmosChains },
} as const;

type Environment = keyof typeof ENV_CHAIN_CONFIGS;

type ChainConfigs = {
  evm: EvmChains;
  cosmos: CosmosChains;
};

/**
 * Gets the chain configurations for the current environment.
 * If the chain configurations are overridden by environment variables,
 * those will be used instead.
 */
export function getEnvChainConfigs(): ChainConfigs {
  // get environment-specific configs as base
  const env = getEnvVariable("REACT_APP_ENV").toLowerCase() as Environment;
  const baseConfig = ENV_CHAIN_CONFIGS[env] || ENV_CHAIN_CONFIGS.local;

  // copy baseConfig to result
  const result = { ...baseConfig };

  // try to get cosmos chains override
  try {
    const cosmosChainsOverride = getEnvVariable("REACT_APP_IBC_CHAINS");
    if (cosmosChainsOverride) {
      result.cosmos = JSON.parse(cosmosChainsOverride);
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
