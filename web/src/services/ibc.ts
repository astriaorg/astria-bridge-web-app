import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import type { ChainInfo } from "@keplr-wallet/types";
import Long from "long";

import { AstriaChainInfo, CelestiaChainInfo } from "chainInfos";
import { getEnvVariable } from "utils";
import { Dec } from "@keplr-wallet/unit";

export const sendIbcTransfer = async (
  sender: string,
  recipient: string,
  amount: string,
) => {
  const SEQUENCER_BRIDGE_ACCOUNT = getEnvVariable(
    "REACT_APP_SEQUENCER_BRIDGE_ACCOUNT",
  );
  const DENOM = getEnvVariable("REACT_APP_SEQUENCER_BRIDGE_DENOM");

  if (window.keplr) {
    const keplr = window.keplr;
    const key = await window.keplr.getKey(CelestiaChainInfo.chainId);
    const sourceChainId = CelestiaChainInfo.chainId;
    const offlineSigner = keplr.getOfflineSigner(sourceChainId);

    if (keplr) {
      try {
        await keplr.experimentalSuggestChain(AstriaChainInfo);
      } catch (e) {
        if (e instanceof Error) {
          console.warn(e.message);
        }
      }
    }

    const client = await SigningStargateClient.connectWithSigner(
      CelestiaChainInfo.rpc,
      offlineSigner,
    );
    const account = await client.getAccount(key.bech32Address);
    const memo = JSON.stringify({ rollupDepositAddress: recipient });
    const fee = {
      amount: [
        {
          denom: DENOM,
          amount: "0",
        },
      ],
      gas: "180000",
    };

    const msgIBCTransfer = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: {
        sourcePort: "transfer",
        sourceChannel: "channel-0",
        token: {
          denom: DENOM,
          amount: amount,
        },
        sender: sender,
        memo: memo,
        receiver: SEQUENCER_BRIDGE_ACCOUNT,
        // Timeout is in nanoseconds. Use Long.UZERO for default timeout
        timeoutTimestamp: Long.fromNumber(Date.now() + 600_000).multiply(
          1_000_000,
        ),
      },
    };

    // Sign and broadcast the transaction
    if (account) {
      const result = await client.signAndBroadcast(
        account.address,
        [msgIBCTransfer],
        fee,
        memo, // FIXME - is this memo needed after realizing we moved it to `value`?
      );
      console.log("Transaction result: ", result);
    } else {
      console.error("Account not found");
    }
  }
};

export const getBalance = async (selectedIbcChain: ChainInfo): Promise<string> => {
  const key = await window.keplr?.getKey(selectedIbcChain.chainId);

  if (key) {
    const client = await StargateClient.connect(selectedIbcChain.rpc);
    const balances = await client.getAllBalances(key.bech32Address);

    const tiaBalance = balances.find((balance) => balance.denom === "utia");

    // calculate precision
    const tiaDecimal = selectedIbcChain.currencies.find(
      (currency: { coinMinimalDenom: string }) =>
        currency.coinMinimalDenom === "utia",
    )?.coinDecimals;

    if (tiaBalance) {
      const amount = new Dec(tiaBalance.amount, tiaDecimal);
      return `${amount.toString(tiaDecimal)} TIA`;
    } else {
      return "0 TIA";
    }
  }

  throw new Error("Failed to get key from Keplr wallet.");
};
