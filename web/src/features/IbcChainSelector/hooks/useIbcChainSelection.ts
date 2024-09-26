import { useMemo, useState, useCallback } from "react";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import type { IbcChainInfo, IbcChains, IbcCurrency } from "config/chainConfigs";

export function useIbcChainSelection(ibcChains: IbcChains) {
  const [selectedIbcChain, setSelectedIbcChain] = useState<IbcChainInfo | null>(
    null,
  );
  const [selectedIbcCurrency, setSelectedIbcCurrency] =
    useState<IbcCurrency | null>(null);

  const ibcChainsOptions = useMemo(() => {
    return Object.entries(ibcChains).map(
      ([chainLabel, chain]): DropdownOption<IbcChainInfo> => ({
        label: chainLabel,
        value: chain,
        leftIconClass: chain.iconClass,
      }),
    );
  }, [ibcChains]);

  const selectIbcChain = useCallback((chain: IbcChainInfo) => {
    setSelectedIbcChain(chain);
  }, []);

  const ibcCurrencyOptions = useMemo(() => {
    if (!selectedIbcChain) {
      return [];
    }
    return selectedIbcChain.currencies?.map(
      (currency): DropdownOption<IbcCurrency> => ({
        label: currency.coinDenom,
        value: currency,
      }),
    );
  }, [selectedIbcChain]);

  const selectIbcCurrency = useCallback((currency: IbcCurrency) => {
    setSelectedIbcCurrency(currency);
  }, []);

  return {
    selectedIbcChain,
    selectIbcChain,
    ibcChainsOptions,
    selectIbcCurrency,
    selectedIbcCurrency,
    ibcCurrencyOptions,
  };
}
