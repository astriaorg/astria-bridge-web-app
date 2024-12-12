import { type EvmChains, getEnvVariable, type CosmosChains } from "config";

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

// Map of environment labels to their chain configurations
const ENV_CHAIN_CONFIGS = {
  local: { evm: localEvmChains, ibc: localIbcChains },
  dusk: { evm: duskEvmChains, ibc: duskIbcChains },
  dawn: { evm: dawnEvmChains, ibc: dawnIbcChains },
  mainnet: { evm: mainnetEvmChains, ibc: mainnetIbcChains },
} as const;

type Environment = keyof typeof ENV_CHAIN_CONFIGS;

type ChainConfigs = {
  evm: EvmChains;
  ibc: CosmosChains;
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
