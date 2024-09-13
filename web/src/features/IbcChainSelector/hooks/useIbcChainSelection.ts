import { useMemo, useState } from "react";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import type { IbcChainInfo, IbcChains } from "config/chainConfigs";

/**
 * Custom hook for selecting an IBC chain from a list of available IBC chains.
 *
 * @param ibcChains - An object containing the available IBC chains.
 *
 * @return An object containing the selected IBC chain, a function to select an IBC chain, and the options for the IBC chain dropdown.
 */
export function useIbcChainSelection(ibcChains: IbcChains) {
  const [selectedIbcChain, setSelectedIbcChain] = useState<IbcChainInfo | null>(
    null,
  );

  const ibcChainsOptions = useMemo(() => {
    return Object.entries(ibcChains).map(
      ([chainLabel, chain]): DropdownOption<IbcChainInfo> => ({
        label: chainLabel,
        value: chain,
      }),
    );
  }, [ibcChains]);

  const selectIbcChain = (chain: IbcChainInfo) => {
    setSelectedIbcChain(chain);
  };

  return {
    selectedIbcChain,
    selectIbcChain,
    ibcChainsOptions,
  };
}
