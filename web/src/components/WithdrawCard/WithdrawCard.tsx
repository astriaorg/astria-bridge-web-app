import type React from "react";
import { useContext, useEffect, useState } from "react";
import { useEthWallet } from "features/EthWallet/hooks/useEthWallet";
import { NotificationsContext } from "features/Notifications/contexts/NotificationsContext";
import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import { NotificationType } from "features/Notifications/components/Notification/types";
import { getKeplrFromWindow } from "services/keplr";
import {
  EthWalletConnector,
  getAstriaWithdrawerService,
} from "features/EthWallet";
import { useIbcChainSelection } from "features/IbcChainSelector";
import Dropdown from "components/Dropdown/Dropdown";
import { useConfig } from "config/hooks/useConfig";

export default function WithdrawCard(): React.ReactElement {
  const { addNotification } = useContext(NotificationsContext);
  const { userAccount, selectedWallet } = useEthWallet();
  const { ibcChains, sequencerBridgeAccount } = useConfig();

  const { selectedIbcChain, selectIbcChain, ibcChainsOptions } =
    useIbcChainSelection(ibcChains);

  const [balance, setBalance] = useState<string>("0 TIA");
  const [fromAddress, setFromAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>("");
  const [isToAddressValid, setIsToAddressValid] = useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (userAccount?.address) {
      setFromAddress(userAccount.address);
    }
    if (userAccount?.balance) {
      setBalance(`${userAccount.balance} TIA`);
    }
  }, [userAccount]);

  useEffect(() => {
    if (amount || toAddress) {
      setHasTouchedForm(true);
    }
    checkIsFormValid(amount, toAddress);
  }, [amount, toAddress]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const checkIsFormValid = (amountInput: string, toAddressInput: string) => {
    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    const isToAddressValid = toAddressInput.length > 0;
    setIsToAddressValid(isToAddressValid);
  };

  const connectKeplrWallet = async () => {
    if (!selectedIbcChain) {
      addNotification({
        toastOpts: {
          toastType: NotificationType.WARNING,
          message: "Please select a chain first.",
          onAcknowledge: () => {},
        },
      });
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
      setToAddress(key.bech32Address);
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
    if (userAccount) {
      setFromAddress(userAccount.address);
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
    if (!selectedWallet || !isAmountValid || !toAddress) {
      console.warn(
        "Withdrawal cannot proceed: missing required fields or fields are invalid",
        {
          selectedWallet,
          isAmountValid,
          toAddress,
        },
      );
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);
    try {
      const withdrawerSvc = getAstriaWithdrawerService(
        selectedWallet.provider,
        sequencerBridgeAccount,
      );
      await withdrawerSvc.withdrawToIbcChain(
        fromAddress,
        toAddress,
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

  return (
    <div>
      <div className="field">
        <label className="field-label">From</label>
        <div className="is-flex is-flex-direction-column">
          <div className="control mt-1 is-flex-grow-1">
            <input
              className="input"
              type="text"
              placeholder="0x..."
              value={fromAddress}
              readOnly
            />
          </div>
          <div className="mt-3">
            <button
              type="button"
              className="button is-ghost is-outlined-light is-tall"
              onClick={() => connectEVMWallet()}
              disabled={fromAddress !== ""}
            >
              {fromAddress ? "Connected to EVM Wallet" : "Connect EVM Wallet"}
            </button>
            {fromAddress && (
              <p className="mt-2 has-text-light">Balance: {balance}</p>
            )}
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Amount</label>
        <div className="control has-icons-right mt-1">
          <input
            className="input"
            type="text"
            placeholder="0.00"
            onChange={updateAmount}
            value={amount}
          />
          <span className="icon is-right mt-1">
            <p>TIA</p>
          </span>
        </div>
        {!isAmountValid && hasTouchedForm && (
          <p className="help is-danger mt-2">
            Amount must be a number greater than 0
          </p>
        )}
      </div>

      {isAnimating ? (
        <AnimatedArrowSpacer isAnimating={isAnimating} />
      ) : (
        <div className="card-spacer" />
      )}

      <div className="field">
        <label className="field-label">To</label>
        <div className="is-flex is-flex-direction-column">
          <div className="control mt-1 is-flex-grow-1">
            <input
              className="input"
              type="text"
              placeholder="celestia..."
              value={toAddress}
              readOnly
            />
          </div>
          <div>
            {!isToAddressValid && hasTouchedForm && (
              <p className="help is-danger mt-2">
                Must be a valid Celestia address
              </p>
            )}
          </div>
          <div className="mt-3 is-flex is-flex-direction-row is-justify-content-space-evenly">
            <Dropdown
              placeholder="Select a chain"
              options={ibcChainsOptions}
              onSelect={(selected) => selectIbcChain(selected)}
              defaultOption={ibcChainsOptions[0]}
            />
            <button
              type="button"
              className="button is-ghost is-outlined-light is-tall"
              onClick={() => connectKeplrWallet()}
              disabled={toAddress !== ""}
            >
              {toAddress ? "Connected to Keplr Wallet" : "Connect Keplr Wallet"}
            </button>
          </div>
        </div>
      </div>

      <div className="card-footer px-4 my-5">
        <button
          type="button"
          className="button card-footer-item is-ghost is-outlined-light has-text-weight-bold"
          onClick={handleWithdraw}
          disabled={
            !isAmountValid ||
            !isToAddressValid ||
            isLoading ||
            !fromAddress ||
            !toAddress
          }
        >
          {isLoading ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
