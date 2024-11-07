import type React from "react";
import { useEffect, useMemo, useState } from "react";

import { Dec, DecUtils } from "@keplr-wallet/unit";
import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import Dropdown from "components/Dropdown/Dropdown";
import { useConfig } from "config";
import { useEvmChainSelection } from "features/EthWallet";
import {
  padDecimal,
  sendIbcTransfer,
  useIbcChainSelection,
} from "features/KeplrWallet";
import { NotificationType, useNotifications } from "features/Notifications";

export default function DepositCard(): React.ReactElement {
  const { evmChains, ibcChains } = useConfig();
  const { addNotification } = useNotifications();

  const {
    evmAccountAddress,
    selectEvmChain,
    evmChainsOptions,
    selectedEvmChain,
    selectedEvmChainOption,
    defaultEvmCurrencyOption,
    selectEvmCurrency,
    evmCurrencyOptions,
    evmBalance,
    isLoadingEvmBalance,
    connectEVMWallet,
  } = useEvmChainSelection(evmChains);

  const {
    ibcAccountAddress: fromAddress,
    selectIbcChain,
    ibcChainsOptions,
    selectedIbcChain,
    selectedIbcChainOption,
    defaultIbcCurrencyOption,
    selectIbcCurrency,
    selectedIbcCurrency,
    ibcCurrencyOptions,
    ibcBalance,
    isLoadingIbcBalance,
    connectKeplrWallet,
  } = useIbcChainSelection(ibcChains);

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

  // recipientAddressOverride is used to allow manual entry of an address
  const [recipientAddressOverride, setRecipientAddressOverride] =
    useState<string>("");
  const [isRecipientAddressEditable, setIsRecipientAddressEditable] =
    useState<boolean>(false);
  const handleEditRecipientClick = () => {
    setIsRecipientAddressEditable(!isRecipientAddressEditable);
  };
  const handleEditRecipientSave = () => {
    setIsRecipientAddressEditable(false);
  };
  const handleEditRecipientClear = () => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
  };
  const updateRecipientAddressOverride = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddressOverride(event.target.value);
  };

  // check if form is valid whenever values change
  useEffect(() => {
    if (evmAccountAddress || amount || recipientAddressOverride) {
      // have touched form when evmAccountAddress or amount change
      setHasTouchedForm(true);
    }
    const recipientAddress = recipientAddressOverride || evmAccountAddress;
    checkIsFormValid(recipientAddress, amount);
  }, [evmAccountAddress, amount, recipientAddressOverride]);

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

  const handleConnectEVMWallet = async () => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    await connectEVMWallet();
  };

  // ensure evm wallet connection when selected EVM chain changes
  /* biome-ignore lint/correctness/useExhaustiveDependencies: */
  useEffect(() => {
    if (!selectedEvmChain) {
      return;
    }
    handleConnectEVMWallet().then((_) => {});
  }, [selectedEvmChain]);

  const handleDeposit = async () => {
    if (!selectedIbcChain || !selectedIbcCurrency) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please select a chain and token to bridge first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }

    const recipientAddress = recipientAddressOverride || evmAccountAddress;
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
      // must left pad the amount with 0 if it starts with a dot because
      // keplr's regex for a decimal is ^-?\d+.?\d*$ so it requires a leading digit
      const amountStrPadded = padDecimal(amount);
      const formattedAmount = DecUtils.getTenExponentN(
        selectedIbcCurrency.coinDecimals,
      )
        .mul(new Dec(amountStrPadded))
        .truncate()
        .toString();

      await sendIbcTransfer(
        selectedIbcChain,
        fromAddress,
        recipientAddress,
        formattedAmount,
        selectedIbcCurrency,
      );
      addNotification({
        toastOpts: {
          toastType: NotificationType.SUCCESS,
          message: "Deposit successful!",
          onAcknowledge: () => {},
        },
      });
    } catch (e) {
      setIsAnimating(false);
      console.error("IBC transfer failed", e);
      const message = e instanceof Error ? e.message : "Unknown error.";
      if (/failed to get account from keplr wallet/i.test(message)) {
        addNotification({
          toastOpts: {
            toastType: NotificationType.DANGER,
            message:
              "Failed to get account from Keplr wallet. Does this address have funds for the selected chain?",
            onAcknowledge: () => {},
          },
        });
      } else {
        addNotification({
          toastOpts: {
            toastType: NotificationType.DANGER,
            component: (
              <>
                <p className="mb-1">Failed to send IBC transfer.</p>
                <p className="message-body-inner">{message}</p>
              </>
            ),
            onAcknowledge: () => {},
          },
        });
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  // disable deposit button if form is invalid
  const isDepositDisabled = useMemo<boolean>((): boolean => {
    if (recipientAddressOverride) {
      // there won't be a selected evm chain and currency if user manually
      // enters a recipient address
      return !(isAmountValid && isRecipientAddressValid && fromAddress);
    }
    return !(
      evmAccountAddress &&
      isAmountValid &&
      isRecipientAddressValid &&
      fromAddress &&
      selectedIbcCurrency?.coinDenom ===
        selectedEvmCurrencyOption?.value?.coinDenom
    );
  }, [
    recipientAddressOverride,
    evmAccountAddress,
    isAmountValid,
    isRecipientAddressValid,
    fromAddress,
    selectedIbcCurrency,
    selectedEvmCurrencyOption,
  ]);

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

  const additionalEvmOptions = useMemo(() => {
    return [
      {
        label: "Connect EVM Wallet",
        action: handleConnectEVMWallet,
        className: "has-text-primary",
        rightIconClass: "fas fa-plus",
      },
      {
        label: "Enter address manually",
        action: handleEditRecipientClick,
        className: "has-text-primary",
        rightIconClass: "fas fa-pen-to-square",
      },
    ];
  }, [handleConnectEVMWallet, handleEditRecipientClick]);

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
        {evmAccountAddress &&
          !isRecipientAddressEditable &&
          !recipientAddressOverride && (
            <div className="field-info-box mt-3 py-2 px-3">
              {evmAccountAddress && (
                <p
                  className="has-text-grey-light has-text-weight-semibold is-clickable"
                  onKeyDown={handleEditRecipientClick}
                  onClick={handleEditRecipientClick}
                >
                  <span className="mr-2">Address: {evmAccountAddress}</span>
                  <i className="fas fa-pen-to-square" />
                </p>
              )}
              {evmAccountAddress && !isLoadingEvmBalance && (
                <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                  Balance: {evmBalance}
                </p>
              )}
              {evmAccountAddress && isLoadingEvmBalance && (
                <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                  Balance: <i className="fas fa-spinner fa-pulse" />
                </p>
              )}
            </div>
          )}
        {recipientAddressOverride && !isRecipientAddressEditable && (
          <div className="field-info-box mt-3 py-2 px-3">
            <p
              className="has-text-grey-light has-text-weight-semibold is-clickable"
              onKeyDown={handleEditRecipientClick}
              onClick={handleEditRecipientClick}
            >
              <span className="mr-2">Address: {recipientAddressOverride}</span>
              <i className="fas fa-pen-to-square" />
            </p>
            <p className="mt-2 has-text-grey-lighter has-text-weight-semibold is-size-7">
              Connect via wallet to show balance
            </p>
          </div>
        )}
        {isRecipientAddressEditable && (
          <div className="field-info-box mt-3 py-2 px-3">
            <div className="has-text-grey-light has-text-weight-semibold">
              <input
                className="input is-medium is-outlined-white"
                type="text"
                placeholder="0x..."
                onChange={updateRecipientAddressOverride}
                value={recipientAddressOverride}
              />
              <button
                type="button"
                className="button is-ghost is-outlined-white mr-2 mt-2"
                onClick={handleEditRecipientSave}
              >
                Save
              </button>
              <button
                type="button"
                className="button is-ghost is-outlined-white mt-2"
                onClick={handleEditRecipientClear}
              >
                Clear
              </button>
            </div>
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
          onClick={() => handleDeposit()}
          disabled={isDepositDisabled}
        >
          {isLoading ? "Processing..." : "Deposit"}
        </button>
      </div>
    </div>
  );
}
