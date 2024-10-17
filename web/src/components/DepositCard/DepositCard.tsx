import type React from "react";
import { useContext, useEffect, useMemo, useState, useRef } from "react";

import { Dec, DecUtils } from "@keplr-wallet/unit";
import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import Dropdown, { type DropdownOption } from "components/Dropdown/Dropdown";
import {
  type EvmChainInfo,
  type IbcChainInfo,
  toChainInfo,
} from "config/chainConfigs";
import { useConfig } from "config/hooks/useConfig";
import { NotificationType } from "features/Notifications/components/Notification/types";
import { NotificationsContext } from "features/Notifications/contexts/NotificationsContext";
import EthWalletConnector from "features/EthWallet/components/EthWalletConnector/EthWalletConnector";
import { useEthWallet } from "features/EthWallet/hooks/useEthWallet";
import { useEvmChainSelection } from "features/EthWallet/hooks/useEvmChainSelection";
import { useIbcChainSelection } from "features/IbcChainSelector/hooks/useIbcChainSelection";
import { sendIbcTransfer } from "services/ibc";
import { getKeplrFromWindow } from "services/keplr";

export default function DepositCard(): React.ReactElement {
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
    ibcBalance,
    isLoadingIbcBalance,
  } = useIbcChainSelection(ibcChains);
  const defaultIbcChainOption = useMemo(() => {
    return ibcChainsOptions[0] || null;
  }, [ibcChainsOptions]);
  const defaultIbcCurrencyOption = useMemo(() => {
    return ibcCurrencyOptions[0] || null;
  }, [ibcCurrencyOptions]);

  // selectedIbcChainOption allows us to ensure the label is set properly
  // in the dropdown when connecting via additional action
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

  const [fromAddress, setFromAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // create refs to hold the latest state values
  const latestState = useRef({
    evmUserAccount,
    selectedWallet,
    recipientAddress,
    selectedEvmChain,
  });

  // update the ref whenever the state changes
  useEffect(() => {
    latestState.current = {
      evmUserAccount,
      selectedWallet,
      recipientAddress,
      selectedEvmChain,
    };
  }, [evmUserAccount, selectedWallet, recipientAddress, selectedEvmChain]);

  // check if form is valid whenever values change
  useEffect(() => {
    if (recipientAddress || amount) {
      // have touched form when recipientAddress or amount change
      setHasTouchedForm(true);
    }
    checkIsFormValid(recipientAddress, amount);
  }, [recipientAddress, amount]);

  // connect to keplr wallet when chain
  useEffect(() => {
    if (!selectedIbcChain) {
      return;
    }
    connectKeplrWallet().then((_) => {});
  }, [selectedIbcChain]);

  useEffect(() => {
    if (!selectedEvmChain) {
      return;
    }
    connectEVMWallet().then((_) => {});
  }, [selectedEvmChain]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (addressInput: string, amountInput: string) => {
    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    // TODO - what validation should we do?
    const addressValid = addressInput.length > 0;
    setIsRecipientAddressValid(addressValid);
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
      setFromAddress(key.bech32Address);
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.startsWith("There is no chain info") || e.message.startsWith("There is no modular chain info"))
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
          const currentState = latestState.current;
          setRecipientAddress("");
          selectEvmChain(null);
          if (currentState.selectedWallet) {
            currentState.selectedWallet = undefined;
          }
        },
        onConfirm: () => {
          const currentState = latestState.current;
          if (!currentState.evmUserAccount) {
            setRecipientAddress("");
            selectEvmChain(null);
          } else {
            setRecipientAddress(currentState.evmUserAccount.address);
          }
        },
      },
    });
  };

  // TODO - also set evm balance

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
        console.error(e.message);
        addNotification({
          toastOpts: {
            toastType: NotificationType.DANGER,
            message: "Failed to send IBC transfer",
            onAcknowledge: () => {},
          },
        });
      }
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
              <Dropdown
                placeholder="Select a token"
                options={evmCurrencyOptions}
                defaultOption={defaultEvmCurrencyOption}
                onSelect={selectEvmCurrency}
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
            !recipientAddress
          }
        >
          {isLoading ? "Processing..." : "Deposit"}
        </button>
      </div>
    </div>
  );
}
