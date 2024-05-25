import type React from "react";
import { useEffect, useState } from "react";
import { CelestiaChainInfo } from "chainInfos";
import { Dec } from "@keplr-wallet/unit";
import { getJSON } from "services/api";
import type { Balances } from "types";
import CopyToClipboardButton from "components/CopyToClipboardButton/CopyToClipboardButton";

export default function BridgeCard(): React.ReactElement {
  const [celestiaAddress, setCelestiaAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    void getKeyFromKeplr();
    void getBalance();
  });

  const getKeyFromKeplr = async () => {
    const key = await window.keplr?.getKey(CelestiaChainInfo.chainId);
    if (key) {
      setCelestiaAddress(key.bech32Address);
    }
  };

  const getBalance = async () => {
    const key = await window.keplr?.getKey(CelestiaChainInfo.chainId);

    if (key) {
      const uri = `${CelestiaChainInfo.rest}/cosmos/bank/v1beta1/balances/${key.bech32Address}?pagination.limit=1000`;

      const data = await getJSON<Balances>(uri);
      const balance = data.balances.find((balance) => balance.denom === "utia");
      const tiaDecimal = CelestiaChainInfo.currencies.find(
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

  return (
    <div className="card p-5">
      <header className="card-header">
        <p className="card-header-title is-size-5 has-text-weight-normal has-text-light">
          Account Details
        </p>
      </header>
      <div className="card-content p-4">
        <div className="mt-3">
          <div className="heading">Celestia address</div>
          <div className="columns is-vcentered">
            <div className="column is-text-overflow">{celestiaAddress}</div>
            <div className="column is-narrow">
              <CopyToClipboardButton textToCopy={celestiaAddress} />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="heading">Balance</div>
          <div className="columns is-vcentered">
            <div className="column is-text-overflow">{balance}</div>
            <div className="column is-narrow" />
          </div>
        </div>
      </div>
    </div>
  );
}
