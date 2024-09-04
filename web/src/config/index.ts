import { type IbcChains, parseMultiChainEnvVars } from "./chains";

export type AppConfig = {
  ibcChains: IbcChains;
};

export function getAppConfig(): AppConfig {
  return {
    ibcChains: parseMultiChainEnvVars(),
  };
}
