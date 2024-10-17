import { useCallback, useEffect, useMemo, useState } from "react";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import type { IbcChainInfo, IbcChains, IbcCurrency } from "config/chainConfigs";
import { getBalanceFromKeplr } from "../../../services/ibc";

export function useIbcChainSelection(ibcChains: IbcChains) {
  const [selectedIbcChain, setSelectedIbcChain] = useState<IbcChainInfo | null>(
    null,
  );
  const [selectedIbcCurrency, setSelectedIbcCurrency] =
    useState<IbcCurrency | null>(null);

  const [ibcBalance, setIbcBalance] = useState<string | null>(null);
  const [isLoadingIbcBalance, setIsLoadingIbcBalance] = useState<boolean>(false);

  useEffect(() => {
    async function getAndSetBalance() {
      if (!selectedIbcChain || !selectedIbcCurrency) {
        return;
      }
      setIsLoadingIbcBalance(true);
      try {
        const balance = await getBalanceFromKeplr(selectedIbcChain, selectedIbcCurrency);
        setIbcBalance(balance);
      } catch (error) {
        console.error("Failed to get balance", error);
      } finally {
        setIsLoadingIbcBalance(false);
      }
    }

    getAndSetBalance().then((_) => {});
  }, [selectedIbcChain, selectedIbcCurrency])

  const ibcChainsOptions = useMemo(() => {
    return Object.entries(ibcChains).map(
      ([chainLabel, chain]): DropdownOption<IbcChainInfo> => ({
        label: chainLabel,
        value: chain,
        leftIconClass: chain.iconClass,
      }),
    );
  }, [ibcChains]);

  const selectIbcChain = useCallback((chain: IbcChainInfo | null) => {
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
        leftIconClass: currency.iconClass,
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
    ibcBalance,
    isLoadingIbcBalance,
  };
}
