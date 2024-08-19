import { useState, useMemo } from "react";
import type { ChainInfo } from "@keplr-wallet/types";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import { ChainConfigs } from "config/chains";

export function useIbcChainSelection() {
  const [selectedIbcChain, setSelectedIbcChain] = useState<ChainInfo | null>(
    null,
  );

  const ibcChainsOptions = useMemo(() => {
    return Object.entries(ChainConfigs).map(
      ([chainLabel, chain]): DropdownOption<ChainInfo> => ({
        label: chainLabel,
        value: chain,
      }),
    );
  }, []);

  const selectIbcChain = (chain: ChainInfo) => {
    setSelectedIbcChain(chain);
  };

  return {
    selectedIbcChain,
    selectIbcChain,
    ibcChainsOptions,
  };
}
