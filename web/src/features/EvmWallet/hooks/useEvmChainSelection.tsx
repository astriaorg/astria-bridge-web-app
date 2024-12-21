import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConfig } from "wagmi";

import type { DropdownOption } from "components/Dropdown/Dropdown";
import {
  type EvmChainInfo,
  type EvmChains,
  type EvmCurrency,
  evmCurrencyBelongsToChain,
} from "config";
import { useBalancePolling } from "features/GetBalancePolling";

import {
  type AstriaErc20WithdrawerService,
  createWithdrawerService,
} from "../services/AstriaWithdrawerService/AstriaWithdrawerService";
import { formatBalance } from "../utils/utils";

export function useEvmChainSelection(evmChains: EvmChains) {
  const { openConnectModal } = useConnectModal();
  const wagmiConfig = useConfig();
  const userAccount = useAccount();

  const nativeTokenBalance = useBalance({
    address: userAccount.address,
  });

  const [selectedEvmChain, setSelectedEvmChain] = useState<EvmChainInfo | null>(
    null,
  );
  const [selectedEvmCurrency, setSelectedEvmCurrency] =
    useState<EvmCurrency | null>(null);
  // track address in hook state. this supports ux where we can clear the address
  const [evmAccountAddress, setEvmAccountAddress] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (selectedEvmChain && selectedEvmCurrency && userAccount?.address) {
      setEvmAccountAddress(userAccount.address);
    }
  }, [userAccount.address, selectedEvmChain, selectedEvmCurrency]);
  const resetState = useCallback(() => {
    setSelectedEvmChain(null);
    setSelectedEvmCurrency(null);
    setEvmAccountAddress(null);
  }, []);

  const getBalanceCallback = useCallback(async () => {
    if (
      !wagmiConfig ||
      !selectedEvmChain ||
      !selectedEvmCurrency ||
      !evmAccountAddress
    ) {
      return null;
    }
    if (!evmCurrencyBelongsToChain(selectedEvmCurrency, selectedEvmChain)) {
      return null;
    }
    if (selectedEvmCurrency.erc20ContractAddress) {
      const withdrawerSvc = createWithdrawerService(
        wagmiConfig,
        selectedEvmCurrency.erc20ContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;
      const balanceRes = await withdrawerSvc.getBalance(
        selectedEvmChain.chainId,
        evmAccountAddress,
      );
      const balanceStr = formatBalance(
        balanceRes.toString(),
        selectedEvmCurrency.coinDecimals,
      );
      return `${balanceStr} ${selectedEvmCurrency.coinDenom}`;
    }

    return `${nativeTokenBalance?.data?.formatted} ${selectedEvmCurrency.coinDenom}`;
  }, [
    wagmiConfig,
    nativeTokenBalance?.data?.formatted,
    selectedEvmChain,
    selectedEvmCurrency,
    evmAccountAddress,
  ]);

  const pollingConfig = useMemo(
    () => ({
      enabled: Boolean(
        selectedEvmChain && selectedEvmCurrency && evmAccountAddress,
      ),
      intervalMS: 10_000,
      onError: (error: Error) => {
        console.error("Failed to get balance from EVM wallet", error);
      },
    }),
    [selectedEvmChain, selectedEvmCurrency, evmAccountAddress],
  );

  const { balance: evmBalance, isLoading: isLoadingEvmBalance } =
    useBalancePolling(getBalanceCallback, pollingConfig);

  const selectedEvmChainNativeToken = useMemo(() => {
    return selectedEvmChain?.currencies[0];
  }, [selectedEvmChain]);

  const withdrawFeeDisplay = useMemo(() => {
    if (!selectedEvmChainNativeToken || !selectedEvmCurrency) {
      return "";
    }

    const fee = formatUnits(
      BigInt(selectedEvmCurrency.ibcWithdrawalFeeWei),
      18,
    );
    return `${fee} ${selectedEvmChainNativeToken.coinDenom}`;
  }, [selectedEvmChainNativeToken, selectedEvmCurrency]);

  const evmChainsOptions = useMemo(() => {
    return Object.entries(evmChains).map(
      ([chainLabel, chain]): DropdownOption<EvmChainInfo> => ({
        label: chainLabel,
        value: chain,
        leftIconClass: chain.iconClass,
      }),
    );
  }, [evmChains]);

  const selectedEvmChainOption = useMemo(() => {
    if (!selectedEvmChain) {
      return null;
    }
    return {
      label: selectedEvmChain?.chainName || "",
      value: selectedEvmChain,
      leftIconClass: selectedEvmChain?.iconClass || "",
    } as DropdownOption<EvmChainInfo>;
  }, [selectedEvmChain]);

  const selectEvmChain = useCallback((chain: EvmChainInfo | null) => {
    setSelectedEvmChain(chain);
  }, []);

  const evmCurrencyOptions = useMemo(() => {
    if (!selectedEvmChain) {
      return [];
    }

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

  const defaultEvmCurrencyOption = useMemo(() => {
    return evmCurrencyOptions[0] || null;
  }, [evmCurrencyOptions]);

  const selectEvmCurrency = useCallback((currency: EvmCurrency) => {
    setSelectedEvmCurrency(currency);
  }, []);

  // opens RainbowKit modal for user to connect their EVM wallet
  const connectEVMWallet = useCallback(() => {
    if (!selectedEvmChain) {
      // FIXME - the fact this function needs to be called again after setting an evm chain
      //  in the parent component is implicit and should be somehow made explicit. this is
      //  hard to debug, especially since the parent uses `useEffect` to call this function.
      // select default chain if none selected, then return.
      // useEffect in parent component handles recalling this function.
      setSelectedEvmChain(evmChainsOptions[0]?.value);
      return;
    }

    if (openConnectModal) {
      openConnectModal();
    }
  }, [selectedEvmChain, openConnectModal, evmChainsOptions]);

  return {
    evmChainsOptions,
    evmCurrencyOptions,

    selectEvmChain,
    selectEvmCurrency,

    selectedEvmChain,
    selectedEvmChainNativeToken,
    withdrawFeeDisplay,
    selectedEvmCurrency,
    defaultEvmCurrencyOption,
    selectedEvmChainOption,

    evmAccountAddress,
    evmBalance,
    isLoadingEvmBalance,

    connectEVMWallet,
    resetState,
  };
}
