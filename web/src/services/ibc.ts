import Long from "long";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { Dec } from "@keplr-wallet/unit";
import type { IbcChainInfo, IbcCurrency } from "config/chainConfigs";

/**
 * Send an IBC transfer from the selected chain to the recipient address.
 * Set `memo` on the tx so the sequencer knows to bridge to an EVM chain.
 * @param selectedIbcChain
 * @param sender
 * @param recipient
 * @param amount
 * @param currency
 */
export const sendIbcTransfer = async (
  selectedIbcChain: IbcChainInfo,
  sender: string,
  recipient: string,
  amount: string,
  currency: IbcCurrency,
) => {
  const keplr = window.keplr;
  if (!keplr) {
    throw new Error("Keplr extension not installed");
  }

  const key = await keplr.getKey(selectedIbcChain.chainId);
  const sourceChainId = selectedIbcChain.chainId;
  const offlineSigner = keplr.getOfflineSigner(sourceChainId);

  const client = await SigningStargateClient.connectWithSigner(
    selectedIbcChain.rpc,
    offlineSigner,
  );
  const account = await client.getAccount(key.bech32Address);
  if (!account) {
    throw new Error("Failed to get account from Keplr wallet.");
  }

  // TODO - does this need to be configurable in the ui?
  const feeDenom = selectedIbcChain.feeCurrencies[0].coinMinimalDenom;
  const memo = JSON.stringify({ rollupDepositAddress: recipient });
  const fee = {
    amount: [
      {
        denom: feeDenom,
        amount: "0",
      },
    ],
    gas: "180000",
  };

  const msgIBCTransfer = {
    typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
    value: {
      sourcePort: "transfer",
      sourceChannel: currency.ibcChannel,
      token: {
        denom: currency.coinMinimalDenom,
        amount: amount,
      },
      sender: sender,
      memo: memo,
      receiver: currency.sequencerBridgeAccount,
      // Timeout is in nanoseconds. Use Long.UZERO for default timeout
      timeoutTimestamp: Long.fromNumber(Date.now() + 600_000).multiply(
        1_000_000,
      ),
    },
  };

  // sign and broadcast the transaction
  const result = await client.signAndBroadcast(
    account.address,
    [msgIBCTransfer],
    fee,
  );
  console.debug("Transaction result: ", result);
};

export const getBalanceFromKeplr = async (
  selectedIbcChain: IbcChainInfo,
  selectedCurrency: IbcCurrency,
): Promise<string> => {
  const keplr = window.keplr;
  if (!keplr) {
    throw new Error("Keplr extension not installed");
  }

  const key = await keplr?.getKey(selectedIbcChain.chainId);
  if (!key) {
    throw new Error("Failed to get key from Keplr wallet.");
  }

  const client = await StargateClient.connect(selectedIbcChain.rpc);
  const balances = await client.getAllBalances(key.bech32Address);

  const denom = selectedCurrency.coinDenom;
  const minimalDenom = selectedCurrency.coinMinimalDenom;
  const decimals = selectedCurrency.coinDecimals;

  // find correct balance based on denom
  const balance = balances.find((balance) => balance.denom === minimalDenom);

  if (!balance) {
    return "0 TIA";
  }

  const amount = new Dec(balance.amount, decimals);
  return `${amount.toString(decimals)} ${denom}`;
};
