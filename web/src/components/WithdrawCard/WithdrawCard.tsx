import type React from "react";
import { useEffect, useMemo, useState } from "react";

import { useConfig } from "config";
import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import Dropdown from "components/Dropdown/Dropdown";
import {
  getAstriaWithdrawerService,
  useEthWallet,
  useEvmChainSelection,
} from "features/EthWallet";
import { useIbcChainSelection } from "features/KeplrWallet";
import { NotificationType, useNotifications } from "features/Notifications";

export default function WithdrawCard(): React.ReactElement {
  const { evmChains, ibcChains } = useConfig();
  const { addNotification } = useNotifications();
  const { selectedWallet } = useEthWallet();

  const {
    evmAccountAddress: fromAddress,
    selectEvmChain,
    evmChainsOptions,
    selectedEvmChain,
    selectedEvmChainOption,
    withdrawFeeDisplay,
    defaultEvmCurrencyOption,
    selectEvmCurrency,
    evmCurrencyOptions,
    selectedEvmCurrency,
    evmBalance,
    isLoadingEvmBalance,
    connectEVMWallet,
  } = useEvmChainSelection(evmChains);

  const {
    ibcAccountAddress: recipientAddress,
    selectIbcChain,
    ibcChainsOptions,
    selectedIbcChain,
    selectedIbcChainOption,
    defaultIbcCurrencyOption,
    selectIbcCurrency,
    ibcCurrencyOptions,
    ibcBalance,
    isLoadingIbcBalance,
    connectKeplrWallet,
  } = useIbcChainSelection(ibcChains);

  // the ibc currency selection is controlled by the sender's chosen evm currency,
  // and should be updated when an ibc currency or ibc chain is selected
  const selectedIbcCurrencyOption = useMemo(() => {
    if (!selectedEvmCurrency) {
      return defaultIbcCurrencyOption;
    }
    const matchingIbcCurrency = selectedIbcChain?.currencies.find(
      (currency) => currency.coinDenom === selectedEvmCurrency.coinDenom,
    );
    if (!matchingIbcCurrency) {
      return null;
    }
    return {
      label: matchingIbcCurrency.coinDenom,
      value: matchingIbcCurrency,
      leftIconClass: matchingIbcCurrency.iconClass,
    };
  }, [selectedEvmCurrency, selectedIbcChain, defaultIbcCurrencyOption]);

  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (amount || recipientAddress) {
      setHasTouchedForm(true);
    }
    checkIsFormValid(amount, recipientAddress);
  }, [amount, recipientAddress]);

  /* biome-ignore lint/correctness/useExhaustiveDependencies: */
  useEffect(() => {
    if (!selectedEvmChain) {
      return;
    }
    connectEVMWallet().then((_) => {});
  }, [selectedEvmChain]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (
    amountInput: string,
    recipientAddressInput: string | null,
  ) => {
    if (recipientAddressInput === null) {
      setIsRecipientAddressValid(false);
      return;
    }
    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    const isRecipientAddressValid = recipientAddressInput.length > 0;
    setIsRecipientAddressValid(isRecipientAddressValid);
  };

  const handleWithdraw = async () => {
    if (
      !selectedWallet ||
      !selectedEvmCurrency ||
      !isAmountValid ||
      !recipientAddress ||
      !fromAddress
    ) {
      console.error(
        "Withdrawal cannot proceed: missing required fields or fields are invalid",
        {
          selectedWallet,
          selectedEvmCurrency,
          isAmountValid,
          recipientAddress,
        },
      );
      // shouldn't really fall into this case
      return;
    }

    if (
      !selectedEvmCurrency?.nativeTokenWithdrawerContractAddress &&
      !selectedEvmCurrency?.erc20ContractAddress
    ) {
      console.error("Withdrawal cannot proceed: missing contract address");
      // shouldn't really fall into this case
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);
    try {
      // NOTE - use contract address if it exists, otherwise use withdrawer contract address
      // FIXME - i don't like the implicit logic of using the existence of contractAddress
      //  to determine if it's an erc20 or not
      const contractAddress =
        selectedEvmCurrency.erc20ContractAddress ||
        selectedEvmCurrency.nativeTokenWithdrawerContractAddress ||
        "";
      const withdrawerSvc = getAstriaWithdrawerService(
        selectedWallet.provider,
        contractAddress,
        Boolean(selectedEvmCurrency.erc20ContractAddress),
      );
      await withdrawerSvc.withdrawToIbcChain(
        fromAddress,
        recipientAddress,
        amount,
        selectedEvmCurrency.coinDecimals,
        selectedEvmCurrency.ibcWithdrawalFeeWei,
        "",
      );
      addNotification({
        toastOpts: {
          toastType: NotificationType.SUCCESS,
          message: "Withdrawal successful!",
          onAcknowledge: () => {},
        },
      });
    } catch (e) {
      setIsAnimating(false);
      console.error("Withdrawal failed:", e);
      const message = e instanceof Error ? e.message : "Unknown error.";
      addNotification({
        toastOpts: {
          toastType: NotificationType.DANGER,
          component: (
            <>
              <p className="mb-1">Withdrawal failed.</p>
              <p className="message-body-inner">{message}</p>
            </>
          ),
          onAcknowledge: () => {},
        },
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

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
                <Dropdown
                  placeholder="Select a token"
                  options={evmCurrencyOptions}
                  defaultOption={defaultEvmCurrencyOption}
                  onSelect={selectEvmCurrency}
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
              {fromAddress && !isLoadingEvmBalance && (
                <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                  Balance: {evmBalance}
                </p>
              )}
              {fromAddress && isLoadingEvmBalance && (
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
          <div className="">
            <span className="icon is-medium">
              <i className="i-arrow-up-arrow-down" />
            </span>
          </div>
          <div className="ml-4 card-spacer" />
        </div>
      )}

      <div className="field">
        <div className="is-flex is-flex-direction-column">
          <div className="is-flex is-flex-direction-row is-align-items-center">
            <div className="label-left">To</div>
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
                  placeholder="No matching token"
                  options={ibcCurrencyOptions}
                  defaultOption={defaultIbcCurrencyOption}
                  onSelect={selectIbcCurrency}
                  valueOverride={selectedIbcCurrencyOption}
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
              {recipientAddress && !isLoadingIbcBalance && (
                <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                  Balance: {ibcBalance}
                </p>
              )}
              {recipientAddress && isLoadingIbcBalance && (
                <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                  Balance: <i className="fas fa-spinner fa-pulse" />
                </p>
              )}
              {withdrawFeeDisplay && (
                <div className="mt-2 has-text-grey-light help">
                  Withdrawal fee: {withdrawFeeDisplay}
                </div>
              )}
            </div>
          )}
        </div>
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
          onClick={handleWithdraw}
          disabled={
            !isAmountValid ||
            !isRecipientAddressValid ||
            isLoading ||
            !fromAddress ||
            !recipientAddress ||
            selectedEvmCurrency?.coinDenom !==
              selectedIbcCurrencyOption?.value?.coinDenom
          }
        >
          {isLoading ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
