import type React from "react";
import { useContext, useEffect, useMemo, useState } from "react";

import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import Dropdown from "components/Dropdown/Dropdown";
import { useConfig } from "config/hooks/useConfig";
import { useIbcChainSelection } from "features/IbcChainSelector";
import {
  EthWalletConnector,
  getAstriaWithdrawerService,
} from "features/EthWallet";
import { useEthWallet } from "features/EthWallet/hooks/useEthWallet";
import { useEvmChainSelection } from "features/EthWallet/hooks/useEvmChainSelection";
import { NotificationType } from "features/Notifications/components/Notification/types";
import { NotificationsContext } from "features/Notifications/contexts/NotificationsContext";
import { getKeplrFromWindow } from "services/keplr";

export default function WithdrawCard(): React.ReactElement {
  const { addNotification } = useContext(NotificationsContext);
  const { userAccount: evmUserAccount, selectedWallet } = useEthWallet();
  const { evmChains, ibcChains } = useConfig();

  const {
    selectEvmChain,
    evmChainsOptions,
    selectedEvmChain,
    selectEvmCurrency,
    evmCurrencyOptions,
    selectedEvmCurrency,
  } = useEvmChainSelection(evmChains);
  const defaultEvmChainOption = useMemo(() => {
    return evmChainsOptions[0] || null;
  }, [evmChainsOptions]);
  const defaultEvmCurrencyOption = useMemo(() => {
    return evmCurrencyOptions[0] || null;
  }, [evmCurrencyOptions]);

  const {
    selectIbcChain,
    ibcChainsOptions,
    selectedIbcChain,
    selectIbcCurrency,
    ibcCurrencyOptions,
    selectedIbcCurrency,
  } = useIbcChainSelection(ibcChains);
  const defaultIbcChainOption = useMemo(() => {
    return ibcChainsOptions[0] || null;
  }, [ibcChainsOptions]);
  const defaultIbcCurrencyOption = useMemo(() => {
    return ibcCurrencyOptions[0] || null;
  }, [ibcCurrencyOptions]);

  const [fromAddress, setFromAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (evmUserAccount?.address) {
      setFromAddress(evmUserAccount.address);
    }
    if (evmUserAccount?.balance) {
      setBalance(`${evmUserAccount.balance} ${selectedEvmCurrency?.coinDenom}`);
    }
  }, [evmUserAccount, selectedEvmCurrency]);

  useEffect(() => {
    if (amount || recipientAddress) {
      setHasTouchedForm(true);
    }
    checkIsFormValid(amount, recipientAddress);
  }, [amount, recipientAddress]);

  useEffect(() => {
    if (!selectedIbcChain || !selectedIbcCurrency) {
      return;
    }
    connectKeplrWallet().then((_) => {});
  }, [selectedIbcChain, selectedIbcCurrency]);

  useEffect(() => {
    if (!selectedEvmChain || !selectedEvmCurrency) {
      return;
    }
    connectEVMWallet().then((_) => {});
  }, [selectedEvmChain, selectedEvmCurrency]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (
    amountInput: string,
    recipientAddressInput: string,
  ) => {
    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    const isRecipientAddressValid = recipientAddressInput.length > 0;
    setIsRecipientAddressValid(isRecipientAddressValid);
  };

  const connectKeplrWallet = async () => {
    if (!selectedIbcChain) {
      // select default chain if none selected, then return. effect handles retriggering.
      selectIbcChain(defaultIbcChainOption.value);
      return;
    }

    const keplr = await getKeplrFromWindow();
    if (!keplr) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.DANGER,
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

    try {
      const key = await keplr.getKey(selectedIbcChain.chainId);
      setRecipientAddress(key.bech32Address);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      addNotification({
        toastOpts: {
          toastType: NotificationType.DANGER,
          message: "Failed to get key from Keplr wallet.",
          onAcknowledge: () => {},
        },
      });
    }
  };

  const connectEVMWallet = async () => {
    if (!selectedEvmChain) {
      // select default chain if none selected, then return. effect handles retriggering.
      selectEvmChain(defaultEvmChainOption.value);
      return;
    }

    addNotification({
      modalOpts: {
        modalType: NotificationType.INFO,
        title: "Connect EVM Wallet",
        component: <EthWalletConnector />,
        onCancel: () => {
          setFromAddress("");
        },
        onConfirm: () => {},
      },
    });
  };

  const handleWithdraw = async () => {
    if (
      !selectedWallet ||
      !selectedEvmCurrency ||
      !isAmountValid ||
      !recipientAddress ||
      !selectedEvmCurrency?.evmWithdrawerContractAddress
    ) {
      console.warn(
        "Withdrawal cannot proceed: missing required fields or fields are invalid",
        {
          selectedWallet,
          isAmountValid,
          recipientAddress,
        },
      );
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);
    try {
      const withdrawerSvc = getAstriaWithdrawerService(
        selectedWallet.provider,
        selectedEvmCurrency.evmWithdrawerContractAddress,
        true, // FIXME - how to determine when erc20? just add flag to config?
      );
      await withdrawerSvc.withdrawToIbcChain(
        fromAddress,
        recipientAddress,
        amount,
        "",
      );
      addNotification({
        toastOpts: {
          toastType: NotificationType.SUCCESS,
          message: "Withdrawal successful!",
          onAcknowledge: () => {},
        },
      });
    } catch (error) {
      console.error("Withdrawal failed:", error);
      addNotification({
        toastOpts: {
          toastType: NotificationType.DANGER,
          message: "Withdrawal failed. Please try again.",
          onAcknowledge: () => {},
        },
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 2000);
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
                disabled={fromAddress !== ""}
                leftIconClass={"i-wallet"}
                additionalOptions={additionalEvmOptions}
                additionalOptionSelectedLabel={evmUserAccount?.address}
              />
            </div>
            {selectedEvmChain && evmCurrencyOptions && (
              <div>
                <Dropdown
                  placeholder="Select a token"
                  options={evmCurrencyOptions}
                  defaultOption={defaultEvmCurrencyOption}
                  onSelect={selectEvmCurrency}
                  disabled={!selectedEvmChain}
                />
              </div>
            )}
          </div>
          {/*<div>*/}
          {/*  {fromAddress && !isLoadingBalance && (*/}
          {/*    <p className="mt-2 has-text-light">Balance: {balance}</p>*/}
          {/*  )}*/}
          {/*  {fromAddress && isLoadingBalance && (*/}
          {/*    <p className="mt-2 has-text-light">*/}
          {/*      Balance: <i className="fas fa-spinner fa-pulse" />*/}
          {/*    </p>*/}
          {/*  )}*/}
          {/*</div>*/}
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
                additionalOptionSelectedLabel={recipientAddress}
              />
            </div>
            {selectedIbcChain && ibcCurrencyOptions && (
              <div>
                <Dropdown
                  placeholder="Select a token"
                  options={ibcCurrencyOptions}
                  defaultOption={defaultIbcCurrencyOption}
                  onSelect={selectIbcCurrency}
                  disabled={!selectedIbcChain}
                />
              </div>
            )}
          </div>
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
            !recipientAddress
          }
        >
          {isLoading ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
