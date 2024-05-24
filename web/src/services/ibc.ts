import { CelestiaChainInfo, AstriaChainInfo } from "../constants";
import { SigningStargateClient } from "@cosmjs/stargate";
import Long from "long";

// const SEQUENCER_ACCOUNT = '1c0c490f1b5528d8173c5de46d131160e4b2c0c3'
// TODO - parameterize this
const SEQUENCER_ACCOUNT = "edf770a8915cd3f70309c918c3d16671f59161e2";
const DENOM = "utia";

export const sendIbcTransfer = async (
  sender: string,
  recipient: string,
  amount: string,
) => {
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
          console.log(e.message);
        }
      }
    }

    const client = await SigningStargateClient.connectWithSigner(
      CelestiaChainInfo.rpc,
      offlineSigner,
    );
    const account = await client.getAccount(key.bech32Address);
    const memo = recipient;
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
        receiver: SEQUENCER_ACCOUNT,
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
