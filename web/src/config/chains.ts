import type { ChainInfo } from "@keplr-wallet/types";
import { getEnvVariable } from "utils";

export type IbcChainInfo = {
  ibcChannel: string;
  iconSourceUrl: string;
} & ChainInfo;

// IbcChains type maps labels to IbcChainInfo objects
export type IbcChains = {
  [label: string]: IbcChainInfo;
};

export function generateChainInfo(envVars: {
  CHAIN_ID: string;
  CHAIN_NAME: string;
  RPC_ENDPOINT: string;
  REST_ENDPOINT: string;
  STAKE_CURRENCY_COIN_DENOM: string;
  STAKE_CURRENCY_COIN_MINIMAL_DENOM: string;
  STAKE_CURRENCY_COIN_DECIMALS: string;
  BIP_44_COIN_TYPE: string;
  BECH32_PREFIX: string;
  CURRENCIES_COIN_DENOM: string;
  CURRENCIES_COIN_MINIMAL_DENOM: string;
  CURRENCIES_COIN_DECIMALS: string;
  FEE_CURRENCIES_COIN_DENOM: string;
  FEE_CURRENCIES_COIN_MINIMAL_DENOM: string;
  FEE_CURRENCIES_COIN_DECIMALS: string;
  FEE_CURRENCIES_GAS_PRICE_STEP_LOW: string;
  FEE_CURRENCIES_GAS_PRICE_STEP_AVERAGE: string;
  FEE_CURRENCIES_GAS_PRICE_STEP_HIGH: string;
  IBC_CHANNEL: string;
  ICON_SOURCE_URL: string;
}): IbcChainInfo {
  return {
    chainId: envVars.CHAIN_ID,
    chainName: envVars.CHAIN_NAME,
    rpc: envVars.RPC_ENDPOINT,
    rest: envVars.REST_ENDPOINT,
    ibcChannel: envVars.IBC_CHANNEL,
    iconSourceUrl: envVars.ICON_SOURCE_URL,
    stakeCurrency: {
      coinDenom: envVars.STAKE_CURRENCY_COIN_DENOM,
      coinMinimalDenom: envVars.STAKE_CURRENCY_COIN_MINIMAL_DENOM,
      coinDecimals: Number.parseInt(envVars.STAKE_CURRENCY_COIN_DECIMALS, 10),
    },
    bip44: {
      coinType: Number.parseInt(envVars.BIP_44_COIN_TYPE, 10),
    },
    bech32Config: {
      bech32PrefixAccAddr: envVars.BECH32_PREFIX,
      bech32PrefixAccPub: `${envVars.BECH32_PREFIX}pub`,
      bech32PrefixConsAddr: `${envVars.BECH32_PREFIX}valcons`,
      bech32PrefixConsPub: `${envVars.BECH32_PREFIX}valconspub`,
      bech32PrefixValAddr: `${envVars.BECH32_PREFIX}valoper`,
      bech32PrefixValPub: `${envVars.BECH32_PREFIX}valoperpub`,
    },
    currencies: [
      {
        coinDenom: envVars.CURRENCIES_COIN_DENOM,
        coinMinimalDenom: envVars.CURRENCIES_COIN_MINIMAL_DENOM,
        coinDecimals: Number.parseInt(envVars.CURRENCIES_COIN_DECIMALS, 10),
      },
    ],
    feeCurrencies: [
      {
        coinDenom: envVars.FEE_CURRENCIES_COIN_DENOM,
        coinMinimalDenom: envVars.FEE_CURRENCIES_COIN_MINIMAL_DENOM,
        coinDecimals: Number.parseInt(envVars.FEE_CURRENCIES_COIN_DECIMALS, 10),
        gasPriceStep: {
          low: Number.parseFloat(envVars.FEE_CURRENCIES_GAS_PRICE_STEP_LOW),
          average: Number.parseFloat(
            envVars.FEE_CURRENCIES_GAS_PRICE_STEP_AVERAGE,
          ),
          high: Number.parseFloat(envVars.FEE_CURRENCIES_GAS_PRICE_STEP_HIGH),
        },
      },
    ],
  };
}

export function parseMultiChainEnvVars(): IbcChains {
  const chainConfigs: IbcChains = {};
  const chainIds = getEnvVariable("REACT_APP_IBC_CHAINS")?.split(",");

  for (const chainId of chainIds) {
    const prefix = `REACT_APP_${chainId}`;
    const chainName = getEnvVariable(`${prefix}_CHAIN_NAME`);
    const envVars = {
      CHAIN_ID: getEnvVariable(`${prefix}_CHAIN_ID`),
      CHAIN_NAME: chainName,
      RPC_ENDPOINT: getEnvVariable(`${prefix}_RPC_ENDPOINT`),
      REST_ENDPOINT: getEnvVariable(`${prefix}_REST_ENDPOINT`),
      IBC_CHANNEL: getEnvVariable(`${prefix}_IBC_CHANNEL`),
      ICON_SOURCE_URL: getEnvVariable(`${prefix}_ICON_SOURCE_URL`),
      STAKE_CURRENCY_COIN_DENOM: getEnvVariable(
        `${prefix}_STAKE_CURRENCY_COIN_DENOM`,
      ),
      STAKE_CURRENCY_COIN_MINIMAL_DENOM: getEnvVariable(
        `${prefix}_STAKE_CURRENCY_COIN_MINIMAL_DENOM`,
      ),
      STAKE_CURRENCY_COIN_DECIMALS: getEnvVariable(
        `${prefix}_STAKE_CURRENCY_COIN_DECIMALS`,
      ),
      BIP_44_COIN_TYPE: getEnvVariable(`${prefix}_BIP_44_COIN_TYPE`),
      BECH32_PREFIX: getEnvVariable(`${prefix}_BECH32_PREFIX`),
      CURRENCIES_COIN_DENOM: getEnvVariable(`${prefix}_CURRENCIES_COIN_DENOM`),
      CURRENCIES_COIN_MINIMAL_DENOM: getEnvVariable(
        `${prefix}_CURRENCIES_COIN_MINIMAL_DENOM`,
      ),
      CURRENCIES_COIN_DECIMALS: getEnvVariable(
        `${prefix}_CURRENCIES_COIN_DECIMALS`,
      ),
      FEE_CURRENCIES_COIN_DENOM: getEnvVariable(
        `${prefix}_FEE_CURRENCIES_COIN_DENOM`,
      ),
      FEE_CURRENCIES_COIN_MINIMAL_DENOM: getEnvVariable(
        `${prefix}_FEE_CURRENCIES_COIN_MINIMAL_DENOM`,
      ),
      FEE_CURRENCIES_COIN_DECIMALS: getEnvVariable(
        `${prefix}_FEE_CURRENCIES_COIN_DECIMALS`,
      ),
      FEE_CURRENCIES_GAS_PRICE_STEP_LOW: getEnvVariable(
        `${prefix}_FEE_CURRENCIES_GAS_PRICE_STEP_LOW`,
      ),
      FEE_CURRENCIES_GAS_PRICE_STEP_AVERAGE: getEnvVariable(
        `${prefix}_FEE_CURRENCIES_GAS_PRICE_STEP_AVERAGE`,
      ),
      FEE_CURRENCIES_GAS_PRICE_STEP_HIGH: getEnvVariable(
        `${prefix}_FEE_CURRENCIES_GAS_PRICE_STEP_HIGH`,
      ),
    };

    if (envVars.RPC_ENDPOINT && envVars.REST_ENDPOINT) {
      chainConfigs[chainName] = generateChainInfo(envVars);
    }
  }

  return chainConfigs;
}

export const ChainConfigs = parseMultiChainEnvVars();
