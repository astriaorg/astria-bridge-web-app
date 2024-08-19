import type React from "react";
import { useContext, useEffect, useState } from "react";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { NotificationType } from "components/Notification/types";
import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import EthWalletConnector from "features/EthWallet/components/EthWalletConnector/EthWalletConnector";
import { NotificationsContext } from "contexts/NotificationsContext";
import { useEthWallet } from "features/EthWallet/hooks/useEthWallet";
import { getJSON } from "services/api";
import { sendIbcTransfer } from "services/ibc";
import { getKeplrFromWindow } from "services/keplr";
import type { Balances } from "types";
import Dropdown from "../Dropdown/Dropdown";
import { useIbcChainSelection } from "../../features/IbcChainSelector/IbcChainSelector";

export default function DepositCard(): React.ReactElement {
  const { addNotification } = useContext(NotificationsContext);
  const { userAccount } = useEthWallet();

  const { selectedIbcChain, selectIbcChain, ibcChainsOptions } =
    useIbcChainSelection();

  const [balance, setBalance] = useState<string>("0 TIA");
  const [fromAddress, setFromAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // set recipient address if userAccount available,
  // which means we got it from the eth wallet
  useEffect(() => {
    if (userAccount) {
      setRecipientAddress(userAccount.address);
    }
  }, [userAccount]);

  // check if form is valid whenever values change
  useEffect(() => {
    if (recipientAddress || amount) {
      // have touched form when recipientAddress or amount change
      setHasTouchedForm(true);
    }
    checkIsFormValid(recipientAddress, amount);
  }, [recipientAddress, amount]);

  const getBalance = async () => {
    if (!selectedIbcChain) {
      return;
    }
    const key = await window.keplr?.getKey(selectedIbcChain.chainId);

    if (key) {
      const uri = `${selectedIbcChain.rest}/cosmos/bank/v1beta1/balances/${key.bech32Address}?pagination.limit=1000`;

      const data = await getJSON<Balances>(uri);
      const balance = data.balances.find((balance) => balance.denom === "utia");
      const tiaDecimal = selectedIbcChain.currencies.find(
        (currency: { coinMinimalDenom: string }) =>
          currency.coinMinimalDenom === "utia",
      )?.coinDecimals;

      if (balance) {
        const amount = new Dec(balance.amount, tiaDecimal);
        setBalance(`${amount.toString(tiaDecimal)} TIA`);
      } else {
        setBalance("0 TIA");
      }
    }
  };

  const sendBalance = async () => {
    setIsLoading(true);
    setIsAnimating(true);
    try {
      await sendIbcTransfer(
        fromAddress,
        recipientAddress,
        DecUtils.getTenExponentN(6).mul(new Dec(amount)).truncate().toString(),
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
      setFromAddress(key.bech32Address);
      await getBalance();
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
    // use existing userAccount if we've already got it
    if (userAccount) {
      setRecipientAddress(userAccount.address);
      return;
    }

    addNotification({
      modalOpts: {
        modalType: NotificationType.INFO,
        title: "Connect EVM Wallet",
        component: <EthWalletConnector />,
        onCancel: () => {
          setRecipientAddress("");
        },
        onConfirm: () => {},
      },
    });
  };

  const checkIsFormValid = (addressInput: string, amountInput: string) => {
    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    // TODO - what validation should we do?
    const addressValid = addressInput.length > 0;
    setIsRecipientAddressValid(addressValid);
  };

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const updateRecipientAddress = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddress(event.target.value);
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
              placeholder="celestia..."
              value={fromAddress}
              readOnly
            />
          </div>
          <div className="mt-3 is-flex is-flex-direction-row is-justify-content-space-evenly">
            <Dropdown
              placeholder="Select a chain"
              options={ibcChainsOptions}
              onSelect={(selected) => selectIbcChain(selected)}
            />
            <button
              type="button"
              className="button is-ghost is-outlined-light is-tall"
              onClick={() => connectKeplrWallet()}
              disabled={fromAddress !== ""}
            >
              {fromAddress
                ? "Connected to Keplr Wallet"
                : "Connect Keplr Wallet"}
            </button>
          </div>
          <div>
            {fromAddress && (
              <p className="mt-2 has-text-light">Balance: {balance}</p>
            )}
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Amount to deposit</label>
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
              placeholder="0x..."
              onChange={updateRecipientAddress}
              value={recipientAddress}
            />
          </div>
          <div className="mt-3">
            <button
              type="button"
              className="button is-ghost is-outlined-light is-tall"
              disabled={recipientAddress !== ""}
              onClick={() => connectEVMWallet()}
            >
              {recipientAddress
                ? "Connected to EVM Wallet"
                : "Connect EVM Wallet"}
            </button>
            {!isRecipientAddressValid && hasTouchedForm && (
              <p className="help is-danger mt-2">Must be a valid EVM address</p>
            )}
          </div>
        </div>
      </div>

      <div className="card-footer px-4 my-5">
        <button
          type="button"
          className="button card-footer-item is-ghost is-outlined-light has-text-weight-bold"
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
