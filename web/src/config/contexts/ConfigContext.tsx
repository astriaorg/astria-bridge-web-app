import React from "react";

import type { AppConfig } from "..";
import type { IbcChains } from "../chainConfigs";
import { getIbcChains } from "../chainConfigs";
import { getEnvVariable } from "../env";

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
  const sequencerBridgeAccount = getEnvVariable(
    "REACT_APP_SEQUENCER_BRIDGE_ACCOUNT",
  );

  return (
    <ConfigContext.Provider value={{ ibcChains, sequencerBridgeAccount }}>
      {children}
    </ConfigContext.Provider>
  );
};
