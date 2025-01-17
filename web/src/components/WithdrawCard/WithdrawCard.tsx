import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConfig as useWagmiConfig } from "wagmi";

import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import Dropdown from "components/Dropdown/Dropdown";
import { useCosmosWallet } from "features/CosmosWallet";
import {
  AddErc20ToWalletButton,
  createWithdrawerService,
  useEvmWallet,
} from "features/EvmWallet";
import { NotificationType, useNotifications } from "features/Notifications";

export default function WithdrawCard(): React.ReactElement {
  const wagmiConfig = useWagmiConfig();
  const { addNotification } = useNotifications();

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
    selectedEvmCurrencyBalance,
    isLoadingSelectedEvmCurrencyBalance,
    connectEvmWallet,
  } = useEvmWallet();

  const {
    cosmosAccountAddress,
    selectCosmosChain,
    cosmosChainsOptions,
    selectedCosmosChain,
    selectedCosmosChainOption,
    defaultIbcCurrencyOption,
    selectIbcCurrency,
    ibcCurrencyOptions,
    cosmosBalance,
    isLoadingCosmosBalance,
    resetState: resetIbcWalletState,
    connectCosmosWallet,
  } = useCosmosWallet();

  // the ibc currency selection is controlled by the sender's chosen evm currency,
  // and should be updated when an ibc currency or ibc chain is selected
  const selectedIbcCurrencyOption = useMemo(() => {
    if (!selectedEvmCurrency) {
      return defaultIbcCurrencyOption;
    }
    const matchingIbcCurrency = selectedCosmosChain?.currencies.find(
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
  }, [selectedEvmCurrency, selectedCosmosChain, defaultIbcCurrencyOption]);

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
  const handleEditRecipientClick = useCallback(() => {
    setIsRecipientAddressEditable(!isRecipientAddressEditable);
  }, [isRecipientAddressEditable]);
  const handleEditRecipientSave = () => {
    setIsRecipientAddressEditable(false);
    // reset ibcWalletState when user manually enters address
    resetIbcWalletState();
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

  useEffect(() => {
    if (amount || cosmosAccountAddress || recipientAddressOverride) {
      setHasTouchedForm(true);
    }
    const recipientAddress =
      recipientAddressOverride || cosmosAccountAddress || null;
    checkIsFormValid(recipientAddress, amount);
  }, [amount, cosmosAccountAddress, recipientAddressOverride]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (
    recipientAddressInput: string | null,
    amountInput: string,
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

  const handleConnectCosmosWallet = useCallback(() => {
    setIsRecipientAddressEditable(false);
    setRecipientAddressOverride("");
    connectCosmosWallet();
  }, [connectCosmosWallet]);

  // ensure evm wallet connection when selected EVM chain changes
  /* biome-ignore lint/correctness/useExhaustiveDependencies: */
  useEffect(() => {
    if (!selectedEvmChain) {
      return;
    }
    connectEvmWallet();
  }, [selectedEvmChain]);

  // ensure cosmos wallet connection when selected ibc chain changes
  useEffect(() => {
    if (!selectedCosmosChain) {
      return;
    }
    handleConnectCosmosWallet();
  }, [selectedCosmosChain, handleConnectCosmosWallet]);

  const handleWithdraw = async () => {
    if (!selectedEvmChain || !selectedEvmCurrency) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please select a chain and token to bridge first.",
          onAcknowledge: () => {},
        },
      });
      return;
    }

    const recipientAddress = recipientAddressOverride || cosmosAccountAddress;
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

    if (
      !selectedEvmCurrency.nativeTokenWithdrawerContractAddress &&
      !selectedEvmCurrency.erc20ContractAddress
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
      if (!contractAddress) {
        throw new Error("No contract address found");
      }
      const withdrawerSvc = createWithdrawerService(
        wagmiConfig,
        contractAddress,
        Boolean(selectedEvmCurrency.erc20ContractAddress),
      );
      await withdrawerSvc.withdrawToIbcChain(
        selectedEvmChain.chainId,
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

  // disable withdraw button if form is invalid
  const isWithdrawDisabled = useMemo<boolean>((): boolean => {
    if (recipientAddressOverride) {
      // there won't be a selected ibc chain and currency if user manually
      // enters a recipient address
      return !(isAmountValid && isRecipientAddressValid && fromAddress);
    }
    return !(
      cosmosAccountAddress &&
      isAmountValid &&
      isRecipientAddressValid &&
      fromAddress &&
      selectedEvmCurrency?.coinDenom ===
        selectedIbcCurrencyOption?.value?.coinDenom
    );
  }, [
    recipientAddressOverride,
    cosmosAccountAddress,
    isAmountValid,
    isRecipientAddressValid,
    fromAddress,
    selectedEvmCurrency,
    selectedIbcCurrencyOption,
  ]);

  const additionalIbcOptions = useMemo(
    () => [
      {
        label: "Connect Keplr Wallet",
        action: handleConnectCosmosWallet,
        className: "has-text-primary",
        leftIconClass: "i-cosmos",
        rightIconClass: "fas fa-plus",
      },
      {
        label: "Enter address manually",
        action: handleEditRecipientClick,
        className: "has-text-primary",
        rightIconClass: "fas fa-pen-to-square",
      },
    ],
    [handleConnectCosmosWallet, handleEditRecipientClick],
  );

  const additionalEvmOptions = useMemo(() => {
    return [
      {
        label: "Connect EVM Wallet",
        action: connectEvmWallet,
        className: "has-text-primary",
        rightIconClass: "fas fa-plus",
      },
    ];
  }, [connectEvmWallet]);

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
              {fromAddress &&
                selectedEvmCurrency &&
                !isLoadingSelectedEvmCurrencyBalance && (
                  <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                    Balance: {selectedEvmCurrencyBalance}
                  </p>
                )}
              {fromAddress && isLoadingSelectedEvmCurrencyBalance && (
                <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                  Balance: <i className="fas fa-spinner fa-pulse" />
                </p>
              )}
              {selectedEvmCurrency?.erc20ContractAddress && (
                <AddErc20ToWalletButton evmCurrency={selectedEvmCurrency} />
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
                placeholder="Connect Keplr Wallet or enter address"
                options={cosmosChainsOptions}
                onSelect={selectCosmosChain}
                leftIconClass={"i-wallet"}
                additionalOptions={additionalIbcOptions}
                valueOverride={selectedCosmosChainOption}
              />
            </div>
            {selectedCosmosChain && ibcCurrencyOptions && (
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
          {cosmosAccountAddress &&
            !isRecipientAddressEditable &&
            !recipientAddressOverride && (
              <div className="field-info-box mt-3 py-2 px-3">
                {cosmosAccountAddress && (
                  <p
                    className="has-text-grey-light has-text-weight-semibold is-clickable"
                    onKeyDown={handleEditRecipientClick}
                    onClick={handleEditRecipientClick}
                  >
                    <span className="mr-2">
                      Address: {cosmosAccountAddress}
                    </span>
                    <i className="fas fa-pen-to-square" />
                  </p>
                )}
                {cosmosAccountAddress && !isLoadingCosmosBalance && (
                  <p className="mt-2 has-text-grey-lighter has-text-weight-semibold">
                    Balance: {cosmosBalance}
                  </p>
                )}
                {cosmosAccountAddress && isLoadingCosmosBalance && (
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
          {recipientAddressOverride && !isRecipientAddressEditable && (
            <div className="field-info-box mt-3 py-2 px-3">
              <p
                className="has-text-grey-light has-text-weight-semibold is-clickable"
                onKeyDown={handleEditRecipientClick}
                onClick={handleEditRecipientClick}
              >
                <span className="mr-2">
                  Address: {recipientAddressOverride}
                </span>
                <i className="fas fa-pen-to-square" />
              </p>
              {!isRecipientAddressValid && hasTouchedForm && (
                <div className="help is-danger mt-2">
                  Recipient address must be a valid address
                </div>
              )}
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
                  placeholder="Enter address"
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
          disabled={isWithdrawDisabled}
        >
          {isLoading ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
