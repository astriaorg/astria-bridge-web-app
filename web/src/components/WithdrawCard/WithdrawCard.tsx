import React, { useContext, useEffect, useState } from "react";
import { useEthWallet } from "features/EthWallet/hooks/useEthWallet";
import { NotificationsContext } from "contexts/NotificationsContext";
import { NotificationType } from "components/Notification/types";
import EthWalletConnector from "features/EthWallet/components/EthWalletConnector/EthWalletConnector";
import { getKeplrFromWindow } from "services/keplr";
import { CelestiaChainInfo } from "chainInfos";

export default function WithdrawCard(): React.ReactElement {
  const { addNotification } = useContext(NotificationsContext);
  const { userAccount, selectedWallet } = useEthWallet();

  const [balance, setBalance] = useState<string>("0 TIA");
  const [fromAddress, setFromAddress] = useState<string>("");

  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>("");

  const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);

  useEffect(() => {
    if (userAccount?.address) {
      setFromAddress(userAccount.address);
    }
    if (userAccount?.balance) {
      setBalance(`${userAccount.balance} TIA`);
    }
  }, [userAccount]);

  // check if form is valid whenever values change
  useEffect(() => {
    if (amount || toAddress) {
      // have touched form when recipientAddress or amount change
      setHasTouchedForm(true);
    }
    checkIsFormValid(amount, toAddress);
  }, [amount, toAddress]);

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };
  const updateFromAddress = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFromAddress(event.target.value);
  };

  const checkIsFormValid = (addressInput: string, amountInput: string) => {
    const amount = Number.parseFloat(amountInput);
    const amountValid = amount > 0;
    setIsAmountValid(amountValid);
    const addressValid = addressInput.length > 0;
    // setIsRecipientAddressValid(addressValid);
  };

  const getBalance = async () => {

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
          onAcknowledge: () => {
          },
        },
      });
      return;
    }

    try {
      const key = await keplr.getKey(CelestiaChainInfo.chainId);
      setToAddress(key.bech32Address);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
      addNotification({
        toastOpts: {
          toastType: NotificationType.DANGER,
          message: "Failed to get key from Keplr wallet.",
          onAcknowledge: () => {
          },
        },
      });
    }
  };

  const connectEVMWallet = async () => {
    // use existing userAccount if we've already got it
    if (userAccount) {
      setFromAddress(userAccount.address);
      return;
    }

    // TODO - get balance

    addNotification({
      modalOpts: {
        modalType: NotificationType.INFO,
        title: "Connect EVM Wallet",
        component: <EthWalletConnector />,
        onCancel: () => {
          setFromAddress("");
        },
        onConfirm: () => {
        },
      },
    });
  };

  return <div className="card p-5">
    <header className="card-header">
      <p className="card-header-title is-size-5 has-text-weight-normal has-text-light">
        Withdraw
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
            placeholder="0x..."
            value={fromAddress}
            onChange={updateFromAddress}
          />
        </div>
        <div className="mt-1">
          <button
            type="button"
            className="button is-ghost is-outlined-light is-tall"
            onClick={() => connectEVMWallet()}
            disabled={fromAddress !== ""}
          >
            {fromAddress ? `${balance}` : "Connect EVM Wallet"}
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
        {!isAmountValid && hasTouchedForm && (
          <p className="help is-danger">
            - Amount must be a number greater than 0
          </p>
        )}
      </div>
    </div>

    <div className="card-spacer" />

    <div className="field">
      <label className="field-label">To</label>
      <div className="is-flex is-flex-direction-row is-justify-content-space-between">
        <div className="control mt-1 mr-5 is-flex-grow-1">
          <input
            className="input"
            type="text"
            placeholder="celestia..."
            value={toAddress}
            readOnly
          />
        </div>
        <div className="mt-1">
          <button
            type="button"
            className="button is-ghost is-outlined-light is-tall"
            onClick={() => connectCelestiaWallet()}
            disabled={toAddress !== ""}
          >
            Connect Keplr Wallet
          </button>
        </div>
      </div>
    </div>

  </div>;
}
