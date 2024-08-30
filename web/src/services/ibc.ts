import Long from "long";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { Dec } from "@keplr-wallet/unit";
import type { IbcChainInfo } from "config/chains";
import { getEnvVariable } from "utils";

export const sendIbcTransfer = async (
  selectedIbcChain: IbcChainInfo,
  sender: string,
  recipient: string,
  amount: string,
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
  const sequencer_bridge_account = getEnvVariable(
    "REACT_APP_SEQUENCER_BRIDGE_ACCOUNT",
  );
  const denom = getEnvVariable("REACT_APP_SEQUENCER_BRIDGE_DENOM");
  const memo = JSON.stringify({ rollupDepositAddress: recipient });
  const fee = {
    amount: [
      {
        denom: denom,
        amount: "0",
      },
    ],
    gas: "180000",
  };

  const msgIBCTransfer = {
    typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
    value: {
      sourcePort: "transfer",
      sourceChannel: selectedIbcChain.ibcChannel,
      token: {
        denom: denom,
        amount: amount,
      },
      sender: sender,
      memo: memo,
      receiver: sequencer_bridge_account,
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
    memo, // FIXME - is this memo needed after realizing we moved it to `value`?
  );
  console.log("Transaction result: ", result);
};

export const getBalance = async (
  selectedIbcChain: IbcChainInfo,
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

  const denom = selectedIbcChain.currencies[0].coinDenom;
  const minimalDenom = selectedIbcChain.currencies[0].coinMinimalDenom;
  const decimals = selectedIbcChain.currencies[0].coinDecimals;

  // find correct balance based on denom
  const balance = balances.find((balance) => balance.denom === minimalDenom);

  if (!balance) {
    return "0 TIA";
  }

  const amount = new Dec(balance.amount, decimals);
  return `${amount.toString(decimals)} ${denom}`;
};
