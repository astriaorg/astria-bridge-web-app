import React from "react";

import type { AppConfig } from "..";
import { EvmChains, getEvmChains, getIbcChains, IbcChains } from "../chainConfigs";

export const ConfigContext = React.createContext<AppConfig | undefined>(
  undefined,
);

type ConfigContextProps = {
  children: React.ReactNode;
};

/**
 * ConfigContextProvider component to provide notifications context to children.
 * @param children
 */
export const ConfigContextProvider: React.FC<ConfigContextProps> = ({
  children,
}) => {
  const ibcChains: IbcChains = getIbcChains();
  const evmChains: EvmChains = getEvmChains();

  return (
    <ConfigContext.Provider value={{ ibcChains, evmChains }}>
      {children}
    </ConfigContext.Provider>
  );
};
