import { useCallback, useEffect, useMemo, useState } from "react";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import {
  cosmosChainNameFromId,
  type IbcChainInfo,
  type IbcChains,
  type IbcCurrency,
  ibcCurrencyBelongsToChain,
} from "config";
import { getBalanceFromChain } from "features/KeplrWallet/services/ibc";
import { useBalancePolling } from "features/GetBalancePolling";
import { useChain } from "@cosmos-kit/react";

/**
 * Custom hook to manage the selection of an IBC chain and currency.
 * Calculates the balance whenever the address, selected chain,
 *   or selected currency changes.
 * Updates the address when the selected chain changes.
 * @param ibcChains - The possible IBC chains to select from.
 */
export function useIbcChainSelection(ibcChains: IbcChains) {
  const [selectedIbcChain, setSelectedIbcChain] = useState<IbcChainInfo | null>(
    null,
  );
  const [selectedIbcCurrency, setSelectedIbcCurrency] =
    useState<IbcCurrency | null>(null);

  // use first chain as default chain
  const defaultChainId = Object.values(ibcChains)[0].chainId;
  const chainName = cosmosChainNameFromId(
    selectedIbcChain?.chainId || defaultChainId,
  );
  const {
    address: cosmosAddressFromWallet,
    openView: openCosmosWalletModal,
    getSigningStargateClient: getCosmosSigningClient,
  } = useChain(chainName);

  // we are keeping track of the address ourselves so that we can clear it if needed,
  // e.g. to allow for manual address entry
  const [ibcAccountAddress, setIbcAccountAddress] = useState<string | null>(
    null,
  );
  useEffect(() => {
    // make sure the address is set when
    // the address, chain, or currency change
    if (selectedIbcChain && cosmosAddressFromWallet) {
      setIbcAccountAddress(cosmosAddressFromWallet);
    }
  }, [cosmosAddressFromWallet, selectedIbcChain, selectedIbcCurrency]);
  const resetState = useCallback(() => {
    setSelectedIbcChain(null);
    setSelectedIbcCurrency(null);
    setIbcAccountAddress(null);
  }, []);

  const getBalanceCallback = useCallback(async () => {
    if (!selectedIbcChain || !selectedIbcCurrency || !ibcAccountAddress) {
      return null;
    }
    if (!ibcCurrencyBelongsToChain(selectedIbcCurrency, selectedIbcChain)) {
      return null;
    }
    return getBalanceFromChain(
      selectedIbcChain,
      selectedIbcCurrency,
      ibcAccountAddress,
    );
  }, [selectedIbcChain, selectedIbcCurrency, ibcAccountAddress]);

  const pollingConfig = useMemo(
    () => ({
      enabled: !!selectedIbcChain && !!selectedIbcCurrency,
      intervalMS: 10_000,
      onError: (error: Error) => {
        console.error("Failed to get balance from Keplr", error);
      },
    }),
    [selectedIbcChain, selectedIbcCurrency],
  );
  const { balance: ibcBalance, isLoading: isLoadingIbcBalance } =
    useBalancePolling(getBalanceCallback, pollingConfig);

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

  const defaultIbcCurrencyOption = useMemo(() => {
    return ibcCurrencyOptions[0] || null;
  }, [ibcCurrencyOptions]);

  // selectedIbcChainOption allows us to ensure the label is set properly
  // in the dropdown when connecting via an "additional option"s action,
  //  e.g. the "Connect Keplr Wallet" option in the dropdown
  const selectedIbcChainOption = useMemo(() => {
    if (!selectedIbcChain) {
      return null;
    }
    return {
      label: selectedIbcChain?.chainName || "",
      value: selectedIbcChain,
      leftIconClass: selectedIbcChain?.iconClass || "",
    } as DropdownOption<IbcChainInfo>;
  }, [selectedIbcChain]);

  const selectIbcCurrency = useCallback((currency: IbcCurrency) => {
    setSelectedIbcCurrency(currency);
  }, []);

  // opens CosmosKit modal for user to connect their Cosmos wallet
  const connectCosmosWallet = useCallback(() => {
    // if there is no selected chain, select the first one
    if (!selectedIbcChain) {
      selectIbcChain(ibcChainsOptions[0]?.value);
      return;
    }

    openCosmosWalletModal();
  }, [
    selectIbcChain,
    selectedIbcChain,
    ibcChainsOptions,
    openCosmosWalletModal,
  ]);

  return {
    ibcChainsOptions,
    ibcCurrencyOptions,

    selectIbcChain,
    selectIbcCurrency,

    selectedIbcChain,
    selectedIbcCurrency,
    defaultIbcCurrencyOption,
    selectedIbcChainOption,

    ibcAccountAddress,
    ibcBalance,
    isLoadingIbcBalance,

    connectCosmosWallet,
    getCosmosSigningClient,
    resetState,
  };
}
