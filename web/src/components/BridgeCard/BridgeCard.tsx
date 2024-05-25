import type React from "react";
import { useState } from "react";
import { Dec, DecUtils } from "@keplr-wallet/unit";

import { CelestiaChainInfo } from "chainInfos";
import { sendIbcTransfer } from "services/ibc";
import { getKeplrFromWindow } from "services/keplr";

export default function BridgeCard(): React.ReactElement {
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isRecipientAddressValid, setIsRecipientAddressValid] =
    useState<boolean>(false); // [1
  const [amount, setAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const sendBalance = async () => {
    const keplr = await getKeplrFromWindow();
    if (!keplr) {
      return;
    }

    const key = await keplr.getKey(CelestiaChainInfo.chainId);

    try {
      await sendIbcTransfer(
        key.bech32Address,
        recipientAddress,
        DecUtils.getTenExponentN(6).mul(new Dec(amount)).truncate().toString(),
      );
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
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
    checkIsFormValid(recipientAddress, event.target.value);
  };

  const updateRecipientAddress = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddress(event.target.value);
    checkIsFormValid(event.target.value, amount);
  };

  return (
    <div className="card p-5">
      <header className="card-header">
        <p className="card-header-title is-size-5 has-text-weight-normal has-text-light">
          Send TIA
        </p>
      </header>

      <div className="field">
        <label className="field-label">Recipient address</label>
        <div className="control mt-1">
          <input
            className="input"
            type="text"
            placeholder="0x..."
            onChange={updateRecipientAddress}
            value={recipientAddress}
          />

          {!isRecipientAddressValid && (
            // TODO - what validation should we do?
            <p className="help is-danger">- Must be a valid address</p>
          )}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Amount</label>
        <div className="control mt-1">
          <input
            className="input"
            type="text"
            placeholder="53"
            onChange={updateAmount}
            value={amount}
          />

          {!isAmountValid && (
            <p className="help is-danger">
              - Amount must be a number greater than 0
            </p>
          )}
        </div>
      </div>

      <div className="card-footer px-4 my-3">
        <button
          type="button"
          className="button card-footer-item is-ghost is-outlined-light has-text-weight-bold"
          onClick={() => sendBalance()}
        >
          Bridge
        </button>
      </div>
    </div>
  );
}
