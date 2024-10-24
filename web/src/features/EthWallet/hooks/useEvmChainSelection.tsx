import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import {
  type EvmChainInfo,
  type EvmChains,
  type EvmCurrency,
  evmCurrencyBelongsToChain,
} from "config";
import { useNotifications, NotificationType } from "features/Notifications";
import { formatBalance } from "utils";

import { useEthWallet } from "features/EthWallet/hooks/useEthWallet";
import EthWalletConnector from "features/EthWallet/components/EthWalletConnector/EthWalletConnector";
import {
  AstriaErc20WithdrawerService,
  getAstriaWithdrawerService,
} from "features/EthWallet/services/AstriaWithdrawerService/AstriaWithdrawerService";

export function useEvmChainSelection(evmChains: EvmChains) {
  const { addNotification } = useNotifications();
  const { selectedWallet, userAccount } = useEthWallet();

  const [selectedEvmChain, setSelectedEvmChain] = useState<EvmChainInfo | null>(
    null,
  );
  const [selectedEvmCurrency, setSelectedEvmCurrency] =
    useState<EvmCurrency | null>(null);
  const [evmAccountAddress, setEvmAccountAddress] = useState<string | null>(
    null,
  );

  const [evmBalance, setEvmBalance] = useState<string | null>(null);
  const [isLoadingEvmBalance, setIsLoadingEvmBalance] =
    useState<boolean>(false);

  useEffect(() => {
    async function getAndSetBalance() {
      if (
        !selectedWallet ||
        !userAccount ||
        !selectedEvmChain ||
        !selectedEvmCurrency ||
        !evmAccountAddress
      ) {
        return;
      }
      if (!evmCurrencyBelongsToChain(selectedEvmCurrency, selectedEvmChain)) {
        return;
      }
      setIsLoadingEvmBalance(true);
      try {
        const contractAddress =
          selectedEvmCurrency.erc20ContractAddress ||
          selectedEvmCurrency.nativeTokenWithdrawerContractAddress ||
          "";
        const withdrawerSvc = getAstriaWithdrawerService(
          selectedWallet.provider,
          contractAddress,
          Boolean(selectedEvmCurrency.erc20ContractAddress),
        );
        if (withdrawerSvc instanceof AstriaErc20WithdrawerService) {
          const balanceRes = await withdrawerSvc.getBalance(evmAccountAddress);
          const balanceStr = formatBalance(balanceRes.toString());
          const balance = `${balanceStr} ${selectedEvmCurrency.coinDenom}`;
          setEvmBalance(balance);
        } else {
          const balance = `${userAccount.balance} ${selectedEvmCurrency.coinDenom}`;
          setEvmBalance(balance);
        }
        setIsLoadingEvmBalance(false);
      } catch (error) {
        console.error("Failed to get balance from EVM", error);
        setIsLoadingEvmBalance(false);
      }
    }

    getAndSetBalance().then((_) => {});
  }, [
    selectedEvmChain,
    selectedEvmCurrency,
    selectedWallet,
    userAccount,
    evmAccountAddress,
  ]);

  const evmChainsOptions = useMemo(() => {
    return Object.entries(evmChains).map(
      ([chainLabel, chain]): DropdownOption<EvmChainInfo> => ({
        label: chainLabel,
        value: chain,
        leftIconClass: chain.iconClass,
      }),
    );
  }, [evmChains]);

  const selectEvmChain = useCallback((chain: EvmChainInfo | null) => {
    setSelectedEvmChain(chain);
  }, []);

  const evmCurrencyOptions = useMemo(() => {
    if (!selectedEvmChain) {
      return [];
    }

    // can only withdraw the currency if it has a withdraw contract address defined
    const withdrawableTokens = selectedEvmChain.currencies?.filter(
      (currency) =>
        currency.erc20ContractAddress ||
        currency.nativeTokenWithdrawerContractAddress,
    );

    return withdrawableTokens.map(
      (currency): DropdownOption<EvmCurrency> => ({
        label: currency.coinDenom,
        value: currency,
        leftIconClass: currency.iconClass,
      }),
    );
  }, [selectedEvmChain]);

  const selectEvmCurrency = useCallback((currency: EvmCurrency) => {
    setSelectedEvmCurrency(currency);
  }, []);

  // create refs to hold the latest state values
  const latestState = useRef({
    userAccount,
    selectedWallet,
    evmAccountAddress,
    selectedEvmChain,
  });

  // update the ref whenever the state changes
  useEffect(() => {
    latestState.current = {
      userAccount,
      selectedWallet,
      evmAccountAddress,
      selectedEvmChain,
    };
  }, [userAccount, selectedWallet, evmAccountAddress, selectedEvmChain]);

  const connectEVMWallet = async () => {
    if (!selectedEvmChain) {
      // select default chain if none selected, then return. effect handles retriggering.
      setSelectedEvmChain(evmChainsOptions[0]?.value);
      return;
    }

    addNotification({
      modalOpts: {
        modalType: NotificationType.INFO,
        title: "Connect EVM Wallet",
        component: <EthWalletConnector />,
        onCancel: () => {
          const currentState = latestState.current;
          setEvmAccountAddress("");
          setSelectedEvmChain(null);
          if (currentState.selectedWallet) {
            currentState.selectedWallet = undefined;
          }
        },
        onConfirm: () => {
          const currentState = latestState.current;
          if (!currentState.userAccount) {
            setEvmAccountAddress("");
            setSelectedEvmChain(null);
          } else {
            setEvmAccountAddress(currentState.userAccount.address);
          }
        },
      },
    });
  };

  return {
    evmChainsOptions,
    evmCurrencyOptions,

    selectEvmChain,
    selectEvmCurrency,

    selectedEvmChain,
    selectedEvmCurrency,

    evmAccountAddress,
    evmBalance,
    isLoadingEvmBalance,

    connectEVMWallet,
  };
}
