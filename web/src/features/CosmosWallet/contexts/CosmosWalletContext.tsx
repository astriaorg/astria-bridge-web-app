import { useChain } from "@cosmos-kit/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import type { SigningStargateClient } from "@cosmjs/stargate";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import {
  type CosmosChainInfo,
  type IbcCurrency,
  cosmosChainNameFromId,
  ibcCurrencyBelongsToChain,
  useConfig,
} from "config";
import { useBalancePolling } from "features/GetBalancePolling";

import { getBalanceFromChain } from "../services/cosmos";

interface CosmosWalletContextProps {
  connectCosmosWallet: () => void;
  cosmosAccountAddress: string | null;
  cosmosBalance: string | null;
  cosmosChainsOptions: DropdownOption<CosmosChainInfo>[];
  defaultIbcCurrencyOption: DropdownOption<IbcCurrency> | undefined;
  disconnectCosmosWallet: () => void;
  getCosmosSigningClient: () => Promise<SigningStargateClient>;
  ibcCurrencyOptions: DropdownOption<IbcCurrency>[];
  isLoadingCosmosBalance: boolean;
  resetState: () => void;
  selectedCosmosChain: CosmosChainInfo | null;
  selectedCosmosChainOption: DropdownOption<CosmosChainInfo> | null;
  selectedIbcCurrency: IbcCurrency | null;
  selectCosmosChain: (chain: CosmosChainInfo | null) => void;
  selectIbcCurrency: (currency: IbcCurrency) => void;
}

export const CosmosWalletContext =
  React.createContext<CosmosWalletContextProps>({} as CosmosWalletContextProps);

interface CosmosWalletProviderProps {
  children: React.ReactNode;
}

export const CosmosWalletProvider: React.FC<CosmosWalletProviderProps> = ({
  children,
}) => {
  const { cosmosChains } = useConfig();

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
    disconnect,
  } = useChain(chainName);

  // we are keeping track of the address ourselves so that we can clear it if
  // needed, e.g. to allow for manual address entry
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
    // if no chain is set, set the first one and return
    // FIXME - the caller has to to re-trigger the connect function
    //  by watching the selectedEvmChain value. this is a foot gun for sure.
    if (!selectedCosmosChain) {
      selectCosmosChain(cosmosChainsOptions[0]?.value);
      return;
    }

    // TODO - if already connected, don't open modal?
    openCosmosWalletModal();
  }, [
    selectCosmosChain,
    selectedCosmosChain,
    cosmosChainsOptions,
    openCosmosWalletModal,
  ]);

  const disconnectCosmosWallet = useCallback(() => {
    disconnect().then((_) => {});
    resetState();
  }, [disconnect, resetState]);

  const value = {
    connectCosmosWallet,
    cosmosAccountAddress,
    cosmosBalance,
    cosmosChainsOptions,
    defaultIbcCurrencyOption,
    getCosmosSigningClient,
    disconnectCosmosWallet,
    ibcCurrencyOptions,
    isLoadingCosmosBalance,
    resetState,
    selectedCosmosChain,
    selectedCosmosChainOption,
    selectedIbcCurrency,
    selectCosmosChain,
    selectIbcCurrency,
  };

  return (
    <CosmosWalletContext.Provider value={value}>
      {children}
    </CosmosWalletContext.Provider>
  );
};
