import { useCallback, useEffect, useMemo, useState } from "react";
import type { Keplr } from "@keplr-wallet/types";
import type { DropdownOption } from "components/Dropdown/Dropdown";
import {
  ibcCurrencyBelongsToChain,
  toChainInfo,
  type IbcChainInfo,
  type IbcChains,
  type IbcCurrency,
} from "config";
import { useNotifications, NotificationType } from "features/Notifications";
import {
  getAddressFromKeplr,
  getBalanceFromKeplr,
  getKeplrFromWindow,
} from "features/KeplrWallet/services/ibc";
import { useBalancePolling } from "features/GetBalancePolling";

/**
 * Custom hook to manage the selection of an IBC chain and currency.
 * Calculates the balance whenever the address, selected chain,
 *   or selected currency changes.
 * Updates the address when the selected chain changes.
 * @param ibcChains - The possible IBC chains to select from.
 */
export function useIbcChainSelection(ibcChains: IbcChains) {
  const { addNotification } = useNotifications();

  const [selectedIbcChain, setSelectedIbcChain] = useState<IbcChainInfo | null>(
    null,
  );
  const [selectedIbcCurrency, setSelectedIbcCurrency] =
    useState<IbcCurrency | null>(null);
  const [ibcAccountAddress, setIbcAccountAddress] = useState<string | null>(
    null,
  );

  const resetState = useCallback(() => {
    setSelectedIbcChain(null);
    setSelectedIbcCurrency(null);
    setIbcAccountAddress(null);
  }, []);

  const getBalanceCallback = useCallback(async () => {
    if (!selectedIbcChain || !selectedIbcCurrency) {
      return null;
    }
    if (!ibcCurrencyBelongsToChain(selectedIbcCurrency, selectedIbcChain)) {
      return null;
    }
    return getBalanceFromKeplr(selectedIbcChain, selectedIbcCurrency);
  }, [selectedIbcChain, selectedIbcCurrency]);

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

  useEffect(() => {
    async function getAddress() {
      if (!selectedIbcChain) {
        return;
      }
      try {
        const address = await getAddressFromKeplr(selectedIbcChain.chainId);
        setIbcAccountAddress(address);
      } catch (e) {
        console.error("Failed to get address from Keplr", e);
      }
    }

    getAddress().then((_) => {});
  }, [selectedIbcChain]);

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

  // ensures Keplr wallet extension is installed.
  // suggests the chain if it doesn't exist in Keplr.
  const connectKeplrWallet = async () => {
    // if there is no selected chain, select the first one
    if (!selectedIbcChain) {
      selectIbcChain(ibcChainsOptions[0]?.value);
      return;
    }

    // show a notification if the Keplr wallet is not installed
    let keplr: Keplr;
    try {
      keplr = getKeplrFromWindow();
    } catch (e) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          component: (
            <p>
              Keplr wallet extension must be installed! You can find it{" "}
              <a
                target="_blank"
                href="https://www.keplr.app/download"
                rel="noreferrer"
              >
                here
              </a>
              .
            </p>
          ),
          onAcknowledge: () => {},
        },
      });
      return;
    }

    // suggest the chain if it doesn't exist in Keplr
    try {
      await keplr.getKey(selectedIbcChain.chainId);
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.startsWith("There is no chain info") ||
          e.message.startsWith("There is no modular chain info"))
      ) {
        try {
          await keplr.experimentalSuggestChain(toChainInfo(selectedIbcChain));
        } catch (e) {
          if (e instanceof Error) {
            selectIbcChain(null);
          }
        }
      } else {
        addNotification({
          toastOpts: {
            toastType: NotificationType.DANGER,
            message: "Failed to get key from Keplr wallet.",
            onAcknowledge: () => {},
          },
        });
      }
    }
  };

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

    connectKeplrWallet,
    resetState,
  };
}
