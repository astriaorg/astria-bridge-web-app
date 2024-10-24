import type React from "react";
import { useContext, useEffect, useMemo, useState } from "react";

import { Dec, DecUtils } from "@keplr-wallet/unit";
import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import Dropdown, { type DropdownOption } from "components/Dropdown/Dropdown";
import type { EvmChainInfo, IbcChainInfo } from "config/chainConfigs";
import { useConfig } from "config/hooks/useConfig";
import { NotificationType } from "features/Notifications/components/Notification/types";
import { NotificationsContext } from "features/Notifications/contexts/NotificationsContext";
import { useEvmChainSelection } from "features/EthWallet/hooks/useEvmChainSelection";
import { useIbcChainSelection } from "features/IbcChainSelector/hooks/useIbcChainSelection";
import { sendIbcTransfer } from "services/ibc";

export default function DepositCard(): React.ReactElement {
  const { addNotification } = useContext(NotificationsContext);
  const { evmChains, ibcChains } = useConfig();

  const {
    evmAccountAddress: recipientAddress,
    selectEvmChain,
    evmChainsOptions,
    selectedEvmChain,
    selectEvmCurrency,
    evmCurrencyOptions,
    evmBalance,
    isLoadingEvmBalance,
    connectEVMWallet,
  } = useEvmChainSelection(evmChains);
  const defaultEvmCurrencyOption = useMemo(() => {
    return evmCurrencyOptions[0] || null;
  }, [evmCurrencyOptions]);

  const {
    ibcAccountAddress: fromAddress,
    selectIbcChain,
    ibcChainsOptions,
    selectedIbcChain,
    selectIbcCurrency,
    ibcCurrencyOptions,
    selectedIbcCurrency,
    ibcBalance,
    isLoadingIbcBalance,
    connectKeplrWallet,
  } = useIbcChainSelection(ibcChains);
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

  // the evm currency selection is controlled by the sender's chosen ibc currency,
  // and should be updated when an ibc currency or evm chain is selected
  const selectedEvmCurrencyOption = useMemo(() => {
    if (!selectedIbcCurrency) {
      return defaultEvmCurrencyOption;
    }
    const matchingEvmCurrency = selectedEvmChain?.currencies.find(
      (currency) => currency.coinDenom === selectedIbcCurrency.coinDenom,
    );
    if (!matchingEvmCurrency) {
      return null;
    }
    return {
      label: matchingEvmCurrency.coinDenom,
      value: matchingEvmCurrency,
      leftIconClass: matchingEvmCurrency.iconClass,
    };
  }, [selectedIbcCurrency, selectedEvmChain, defaultEvmCurrencyOption]);

  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // check if form is valid whenever values change
  useEffect(() => {
    if (recipientAddress || amount) {
      // have touched form when recipientAddress or amount change
      setHasTouchedForm(true);
    }
    checkIsFormValid(recipientAddress, amount);
  }, [recipientAddress, amount]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (
    addressInput: string | null,
    amountInput: string,
  ) => {
    if (addressInput === null) {
      setIsRecipientAddressValid(false);
      return;
    }

    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    // TODO - what validation should we do?
    const addressValid = addressInput.length > 0;
    setIsRecipientAddressValid(addressValid);
  };

  // ensure evm wallet connection when selected EVM chain changes
  /* biome-ignore lint/correctness/useExhaustiveDependencies: */
  useEffect(() => {
    if (!selectedEvmChain) {
      return;
    }
    connectEVMWallet().then((_) => {});
  }, [selectedEvmChain]);

  const sendBalance = async () => {
    if (!selectedIbcChain || !selectedIbcCurrency) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please select a chain and token first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }
    if (!fromAddress || !recipientAddress) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please connect your Keplr and EVM wallet first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);
    try {
      await sendIbcTransfer(
        selectedIbcChain,
        fromAddress,
        recipientAddress,
        DecUtils.getTenExponentN(6).mul(new Dec(amount)).truncate().toString(),
        selectedIbcCurrency,
      );
    } catch (e) {
      if (e instanceof Error) {
        if (/failed to get account from keplr wallet/i.test(e.message)) {
          addNotification({
            toastOpts: {
              toastType: NotificationType.DANGER,
              message:
                "Failed to get account from Keplr wallet. Does this address have funds for the selected chain?",
              onAcknowledge: () => {},
            },
          });
        } else {
          console.error(e.message);
          addNotification({
            toastOpts: {
              toastType: NotificationType.DANGER,
              message: "Failed to send IBC transfer",
              onAcknowledge: () => {},
            },
          });
        }
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 2000);
    }
  };

  // this additional option is the "Connect Keplr Wallet" button
  const additionalIbcOptions = useMemo(
    () => [
      {
        label: "Connect Keplr Wallet",
        action: connectKeplrWallet,
        className: "has-text-primary",
        leftIconClass: "i-keplr",
        rightIconClass: "fas fa-plus",
      },
    ],
    [connectKeplrWallet],
  );

  // this additional option is the "Connect EVM Wallet" button
  const additionalEvmOptions = useMemo(() => {
    return [
      {
        label: "Connect EVM Wallet",
        action: connectEVMWallet,
        className: "has-text-primary",
        rightIconClass: "fas fa-plus",
      },
    ];
  }, [connectEVMWallet]);

  return (
    <div>
      <div className="field">
        <div className="is-flex is-flex-direction-column">
          <div className="is-flex is-flex-direction-row is-align-items-center mb-3">
            <div className="label-left">From</div>
            <div className="is-flex-grow-1">
              <Dropdown
                placeholder="Select..."
                options={ibcChainsOptions}
                onSelect={selectIbcChain}
                leftIconClass={"i-wallet"}
                additionalOptions={additionalIbcOptions}
                valueOverride={selectedIbcChainOption}
              />
            </div>
            {selectedIbcChain && ibcCurrencyOptions && (
              <div className="ml-3">
                <Dropdown
                  placeholder="Select a token"
                  options={ibcCurrencyOptions}
                  defaultOption={defaultIbcCurrencyOption}
                  onSelect={selectIbcCurrency}
                />
              </div>
            )}
          </div>
          {fromAddress && (
            <div className="field-info-box py-2 px-3">
              {fromAddress && (
                <p className="has-text-grey-light has-text-weight-semibold">
                  Address: {fromAddress}
                </p>
              )}
              {fromAddress && !isLoadingIbcBalance && (
                <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                  Balance: {ibcBalance}
                </p>
              )}
              {fromAddress && isLoadingIbcBalance && (
                <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                  Balance: <i className="fas fa-spinner fa-pulse" />
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {isAnimating ? (
        <AnimatedArrowSpacer isAnimating={isAnimating} />
      ) : (
        <div className="is-flex is-flex-direction-row">
          <div>
            <span className="icon is-medium">
              <i className="i-arrow-up-arrow-down" />
            </span>
          </div>
          <div className="ml-4 card-spacer" />
        </div>
      )}

      <div className="field">
        <div className="is-flex is-flex-direction-row is-align-items-center">
          <div className="label-left">To</div>
          <div className="is-flex-grow-1">
            <Dropdown
              placeholder="Connect EVM Wallet"
              options={evmChainsOptions}
              onSelect={selectEvmChain}
              leftIconClass={"i-wallet"}
              additionalOptions={additionalEvmOptions}
              valueOverride={selectedEvmChainOption}
            />
          </div>
          {selectedEvmChain && evmCurrencyOptions && (
            <div className="ml-3">
              {/* NOTE - the placeholder happens to only be shown when there isn't a matching */}
              {/* evm currency. It's also always disabled because it's controlled by sender currency selection. */}
              <Dropdown
                placeholder="No matching token"
                options={evmCurrencyOptions}
                defaultOption={defaultEvmCurrencyOption}
                onSelect={selectEvmCurrency}
                valueOverride={selectedEvmCurrencyOption}
                disabled={true}
              />
            </div>
          )}
        </div>
        {recipientAddress && (
          <div className="field-info-box mt-3 py-2 px-3">
            {recipientAddress && (
              <p className="has-text-grey-light has-text-weight-semibold">
                Address: {recipientAddress}
              </p>
            )}
            {recipientAddress && !isLoadingEvmBalance && (
              <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                Balance: {evmBalance}
              </p>
            )}
            {recipientAddress && isLoadingEvmBalance && (
              <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                Balance: <i className="fas fa-spinner fa-pulse" />
              </p>
            )}
          </div>
        )}
      </div>

      <div className="is-flex is-flex-direction-row is-align-items-center">
        <div className="card-spacer" />
      </div>

      <div className="field">
        <div className="is-flex is-flex-direction-row is-align-items-center">
          <div className="label-left">Amount</div>
          <div className="control mt-1 is-flex-grow-1">
            <input
              className="input is-medium"
              type="text"
              placeholder="0.00"
              onChange={updateAmount}
              value={amount}
            />
          </div>
        </div>
        {!isAmountValid && hasTouchedForm && (
          <div className="help is-danger mt-2">
            Amount must be a number greater than 0
          </div>
        )}
      </div>

      <div className="card-footer mt-4">
        <button
          type="button"
          className="button is-tall is-wide has-gradient-to-right-orange has-text-weight-bold has-text-white"
          onClick={() => sendBalance()}
          disabled={
            !isAmountValid ||
            !isRecipientAddressValid ||
            !fromAddress ||
            !recipientAddress ||
            selectedIbcCurrency?.coinDenom !==
              selectedEvmCurrencyOption?.value?.coinDenom
          }
        >
          {isLoading ? "Processing..." : "Deposit"}
        </button>
      </div>
    </div>
  );
}
