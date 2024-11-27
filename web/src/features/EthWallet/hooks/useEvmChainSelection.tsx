import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useConfig } from "wagmi";

import type { DropdownOption } from "components/Dropdown/Dropdown";
import {
  type EvmChainInfo,
  type EvmChains,
  type EvmCurrency,
  evmCurrencyBelongsToChain,
} from "config";

import {
  type AstriaErc20WithdrawerService,
  createWithdrawerService,
} from "features/EthWallet/services/AstriaWithdrawerService/AstriaWithdrawerService";
import { formatBalance } from "features/EthWallet/utils/utils";
import { useBalancePolling } from "features/GetBalancePolling";
import { formatUnits } from "viem";

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
  const [evmAccountAddress, setEvmAccountAddress] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (userAccount?.address) {
      setEvmAccountAddress(userAccount.address);
    }
  }, [userAccount.address]);

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

  const connectEVMWallet = async () => {
    if (!selectedEvmChain) {
      // select default chain if none selected, then return. effect handles retriggering.
      setSelectedEvmChain(evmChainsOptions[0]?.value);
      return;
    }

    if (openConnectModal) {
      openConnectModal();
    }
  };

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
