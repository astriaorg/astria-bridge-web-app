import { useState, useMemo } from "react";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import { ChainConfigs, type IbcChainInfo } from "config/chains";

export function useIbcChainSelection() {
  const [selectedIbcChain, setSelectedIbcChain] = useState<IbcChainInfo | null>(
    null,
  );

  const ibcChainsOptions = useMemo(() => {
    return Object.entries(ChainConfigs).map(
      ([chainLabel, chain]): DropdownOption<IbcChainInfo> => ({
        label: chainLabel,
        value: chain,
      }),
    );
  }, []);

  const selectIbcChain = (chain: IbcChainInfo) => {
    setSelectedIbcChain(chain);
  };

  return {
    selectedIbcChain,
    selectIbcChain,
    ibcChainsOptions,
  };
}
