import { useContext } from "react";

import { ConfigContext } from "config/contexts/ConfigContext";

/**
 * Hook to use the config context.
 */
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigContextProvider");
  }
  return context;
};
