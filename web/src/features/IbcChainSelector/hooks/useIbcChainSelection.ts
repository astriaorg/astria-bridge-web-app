import { useMemo, useState } from "react";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import type { IbcChainInfo } from "config/chains";
import { getAppConfig } from "config";

export function useIbcChainSelection() {
  const [selectedIbcChain, setSelectedIbcChain] = useState<IbcChainInfo | null>(
    null,
  );

  const ibcChainsOptions = useMemo(() => {
    return Object.entries(getAppConfig().ibcChains).map(
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
