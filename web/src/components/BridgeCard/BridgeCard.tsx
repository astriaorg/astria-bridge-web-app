import type React from "react";
import { useContext, useEffect, useState } from "react";
import { Dec, DecUtils } from "@keplr-wallet/unit";

import { CelestiaChainInfo } from "chainInfos";
import { NotificationType } from "components/Notification/types";
import EthWalletConnector from "features/EthWallet/components/EthWalletConnector/EthWalletConnector";
import { NotificationsContext } from "contexts/NotificationsContext";
import { useEthWallet } from "features/EthWallet/hooks/useEthWallet";
import { sendIbcTransfer } from "services/ibc";
import { getKeplrFromWindow } from "services/keplr";

export default function BridgeCard(): React.ReactElement {
  const [fromAddress, setFromAddress] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const { addNotification } = useContext(NotificationsContext);
  const { userAccount } = useEthWallet();

  useEffect(() => {
    if (userAccount) {
      setRecipientAddress(userAccount);
    }
  }, [userAccount]);

  useEffect(() => {
    checkIsFormValid(recipientAddress, amount);
  }, [recipientAddress, amount]);

  const sendBalance = async () => {
    try {
      await sendIbcTransfer(
        fromAddress,
        recipientAddress,
        DecUtils.getTenExponentN(6).mul(new Dec(amount)).truncate().toString(),
      );
    } catch (e) {
      if (e instanceof Error) {
        addNotification({
          toastOpts: {
            toastType: NotificationType.DANGER,
            message: "Failed to send IBC transfer",
            onAcknowledge: () => {},
          },
        });
      }
    }
  };

  const connectCelestiaWallet = async () => {
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
      const key = await keplr.getKey(CelestiaChainInfo.chainId);
      setFromAddress(key.bech32Address);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
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
      setRecipientAddress(userAccount);
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
    <div className="card p-5">
      <header className="card-header">
        <p className="card-header-title is-size-5 has-text-weight-normal has-text-light">
          Deposit TIA
        </p>
      </header>

      <div className="card-spacer" />

      <div className="field">
        <label className="field-label">From</label>
        <div className="is-flex is-flex-direction-row is-justify-content-space-between">
          <div className="control mt-1 mr-5 is-flex-grow-1">
            <input
              className="input"
              type="text"
              placeholder="celestia..."
              value={fromAddress}
              readOnly
            />
          </div>
          <div className="mt-1">
            <button
              type="button"
              className="button is-ghost is-outlined-light is-tall"
              onClick={() => connectCelestiaWallet()}
            >
              Connect Keplr Wallet
            </button>
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
          {!isAmountValid && (
            <p className="help is-danger">
              - Amount must be a number greater than 0
            </p>
          )}
        </div>
      </div>

      <div className="card-spacer" />

      <div className="field">
        <label className="field-label">Recipient address</label>
        <div className="is-flex is-flex-direction-row is-justify-content-space-between">
          <div className="control mt-1 mr-5 is-flex-grow-1">
            <input
              className="input"
              type="text"
              placeholder="0x..."
              onChange={updateRecipientAddress}
              value={recipientAddress}
            />

            {!isRecipientAddressValid && (
              // TODO - what validation should we do?
              <p className="help is-danger">- Must be a valid EVM address</p>
            )}
          </div>
          <div className="mt-1">
            <button
              type="button"
              className="button is-ghost is-outlined-light is-tall"
              onClick={() => connectEVMWallet()}
            >
              Connect EVM Wallet
            </button>
          </div>
        </div>
      </div>

      <div className="card-footer px-4 my-5">
        <button
          type="button"
          className="button card-footer-item is-ghost is-outlined-light has-text-weight-bold"
          onClick={() => sendBalance()}
          disabled={!isAmountValid || !isRecipientAddressValid}
        >
          Deposit
        </button>
      </div>
    </div>
  );
}
