import { useChain } from "@cosmos-kit/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { DropdownOption } from "components/Dropdown/Dropdown";
import {
  type CosmosChainInfo,
  type CosmosChains,
  type IbcCurrency,
  cosmosChainNameFromId,
  ibcCurrencyBelongsToChain,
} from "config";
import { useBalancePolling } from "features/GetBalancePolling";
import { getBalanceFromChain } from "../services/cosmos";

/**
 * Custom hook to manage the selection of an IBC chain and currency.
 * Calculates the balance whenever the address, selected chain,
 *   or selected currency changes.
 * Updates the address when the selected chain changes.
 */
export function useCosmosChainSelection(cosmosChains: CosmosChains) {
  const [selectedCosmosChain, setSelectedCosmosChain] =
    useState<CosmosChainInfo | null>(null);
  const [selectedIbcCurrency, setSelectedIbcCurrency] =
    useState<IbcCurrency | null>(null);

  // use first chain as default chain
  const defaultChainId = Object.values(cosmosChains)[0].chainId;
  const chainName = cosmosChainNameFromId(
    selectedCosmosChain?.chainId || defaultChainId,
  );
  const {
    address: cosmosAddressFromWallet,
    openView: openCosmosWalletModal,
    getSigningStargateClient: getCosmosSigningClient,
  } = useChain(chainName);

  // we are keeping track of the address ourselves so that we can clear it if needed,
  // e.g. to allow for manual address entry
  const [cosmosAccountAddress, setCosmosAccountAddress] = useState<
    string | null
  >(null);
  useEffect(() => {
    // make sure the address is set when
    // the address, chain, or currency change
    if (selectedCosmosChain && selectedIbcCurrency && cosmosAddressFromWallet) {
      setCosmosAccountAddress(cosmosAddressFromWallet);
    }
  }, [cosmosAddressFromWallet, selectedCosmosChain, selectedIbcCurrency]);
  const resetState = useCallback(() => {
    setSelectedCosmosChain(null);
    setSelectedIbcCurrency(null);
    setCosmosAccountAddress(null);
  }, []);

  const getBalanceCallback = useCallback(async () => {
    if (!selectedCosmosChain || !selectedIbcCurrency || !cosmosAccountAddress) {
      return null;
    }
    if (!ibcCurrencyBelongsToChain(selectedIbcCurrency, selectedCosmosChain)) {
      return null;
    }
    return getBalanceFromChain(
      selectedCosmosChain,
      selectedIbcCurrency,
      cosmosAccountAddress,
    );
  }, [selectedCosmosChain, selectedIbcCurrency, cosmosAccountAddress]);

  const pollingConfig = useMemo(
    () => ({
      enabled: !!selectedCosmosChain && !!selectedIbcCurrency,
      intervalMS: 10_000,
      onError: (error: Error) => {
        console.error("Failed to get balance from Keplr", error);
      },
    }),
    [selectedCosmosChain, selectedIbcCurrency],
  );
  const { balance: cosmosBalance, isLoading: isLoadingCosmosBalance } =
    useBalancePolling(getBalanceCallback, pollingConfig);

  const cosmosChainsOptions = useMemo(() => {
    return Object.entries(cosmosChains).map(
      ([chainLabel, chain]): DropdownOption<CosmosChainInfo> => ({
        label: chainLabel,
        value: chain,
        leftIconClass: chain.iconClass,
      }),
    );
  }, [cosmosChains]);

  const selectCosmosChain = useCallback((chain: CosmosChainInfo | null) => {
    setSelectedCosmosChain(chain);
  }, []);

  const ibcCurrencyOptions = useMemo(() => {
    if (!selectedCosmosChain) {
      return [];
    }
    return selectedCosmosChain.currencies?.map(
      (currency): DropdownOption<IbcCurrency> => ({
        label: currency.coinDenom,
        value: currency,
        leftIconClass: currency.iconClass,
      }),
    );
  }, [selectedCosmosChain]);

  const defaultIbcCurrencyOption = useMemo(() => {
    return ibcCurrencyOptions[0] || null;
  }, [ibcCurrencyOptions]);

  // selectedCosmosChainOption allows us to ensure the label is set properly
  // in the dropdown when connecting via an "additional option"s action,
  //  e.g. the "Connect Keplr Wallet" option in the dropdown
  const selectedCosmosChainOption = useMemo(() => {
    if (!selectedCosmosChain) {
      return null;
    }
    return {
      label: selectedCosmosChain?.chainName || "",
      value: selectedCosmosChain,
      leftIconClass: selectedCosmosChain?.iconClass || "",
    } as DropdownOption<CosmosChainInfo>;
  }, [selectedCosmosChain]);

  const selectIbcCurrency = useCallback((currency: IbcCurrency) => {
    setSelectedIbcCurrency(currency);
  }, []);

  // opens CosmosKit modal for user to connect their Cosmos wallet
  const connectCosmosWallet = useCallback(() => {
    // if there is no selected chain, select the first one
    if (!selectedCosmosChain) {
      selectCosmosChain(cosmosChainsOptions[0]?.value);
      return;
    }

    openCosmosWalletModal();
  }, [
    selectCosmosChain,
    selectedCosmosChain,
    cosmosChainsOptions,
    openCosmosWalletModal,
  ]);

  return {
    cosmosChainsOptions,
    selectedCosmosChain,
    selectedCosmosChainOption,
    defaultIbcCurrencyOption,

    ibcCurrencyOptions,
    selectCosmosChain,
    selectIbcCurrency,
    selectedIbcCurrency,

    cosmosAccountAddress,
    cosmosBalance,
    isLoadingCosmosBalance,

    connectCosmosWallet,
    getCosmosSigningClient,
    resetState,
  };
}
