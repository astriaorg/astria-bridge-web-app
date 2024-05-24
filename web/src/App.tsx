import React, {useEffect} from 'react';
import {getKeplrFromWindow} from "services/keplr";
// NOTE - you'll notice constants is the only one imported by path.
//  b/c we're using some polyfills that use node's built in `constants`,
//  there's
import {CelestiaChainInfo} from "./constants";
import {Balances} from "types";
import {Dec, DecUtils} from "@keplr-wallet/unit";
import {sendIbcTransfer} from "services/ibc";
import {getJSON} from "services/api";
import logo from "./logo.svg";


function App() {
  const [address, setAddress] = React.useState<string>('');
  const [balance, setBalance] = React.useState<string>('');

  const [recipient, setRecipient] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');

  useEffect(() => {
    void init();
  }, []);

  const init = async () => {
    const keplr = await getKeplrFromWindow();

    if(keplr) {
      try {
        await keplr.experimentalSuggestChain(CelestiaChainInfo);
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
      }
    }
  }

  const getKeyFromKeplr = async () => {
    const key = await window.keplr?.getKey(CelestiaChainInfo.chainId);
    if (key) {
      setAddress(key.bech32Address)
    }
  }

  const getBalance = async () => {
    const key = await window.keplr?.getKey(CelestiaChainInfo.chainId);

    if (key) {
      const uri = `${CelestiaChainInfo.rest}/cosmos/bank/v1beta1/balances/${key.bech32Address}?pagination.limit=1000`;

      const data = await getJSON<Balances>(uri);
      const balance = data.balances.find((balance) => balance.denom === "utia");
      const tiaDecimal = CelestiaChainInfo.currencies.find((currency: { coinMinimalDenom: string; }) => currency.coinMinimalDenom === "utia")?.coinDecimals;

      if(balance) {
        const amount = new Dec(balance.amount, tiaDecimal);
        setBalance(`${amount.toString(tiaDecimal)} TIA`)
      } else {
        setBalance(`0 TIA`)
      }
    }
  }

  const sendBalance = async () => {
    if (window.keplr) {
      const key = await window.keplr.getKey(CelestiaChainInfo.chainId);
      console.log('key: ', key);

      try {
        await sendIbcTransfer(key.bech32Address, recipient, DecUtils.getTenExponentN(6).mul(new Dec(amount)).truncate().toString())
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
      }

    }
  }


  return (
    <div className="root-container">
        <div style={{
            display: "flex",
            justifyContent: "center",
            padding: "16px"
        }}>
          <img src={logo} style={{maxWidth: "200px"}} alt="keplr-logo" />
        </div>



      <div className="item-container">
        <div className="item">
          <div className="item-title">
            Get TIA Address
          </div>

          <div className="item-content">
            <div>
              Address: {address}
            </div>

            <div>
              <button className="keplr-button" onClick={getKeyFromKeplr}>Get Address</button>
            </div>
          </div>
        </div>

        <div className="item">
          <div className="item-title">
            Get TIA Balance
          </div>

          <div className="item-content">
            Balance: {balance}

            <button className="keplr-button" onClick={getBalance}>Get Balance</button>
          </div>
        </div>

        <div className="item">
          <div className="item-title">
            Send TIA
          </div>

          <div className="item-content">
            <div style={{
              display: "flex",
              flexDirection: "column"
            }}>
              Recipient:
              <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column"
            }}>
              Amount:
              <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            <button className="keplr-button" onClick={sendBalance}>Send</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
