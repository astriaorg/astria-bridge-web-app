import { Decimal } from "@cosmjs/math";
import type { SigningStargateClient } from "@cosmjs/stargate";
import type { CosmosChainInfo, IbcCurrency } from "config";
import { osmosis } from "osmojs";
import { nowPlusMinutesInNano } from "../utils/utils.ts";

/**
 * Send an IBC transfer from the selected chain to the recipient address.
 * Set `memo` on the tx so the sequencer knows to bridge to an EVM chain.
 */
export const sendIbcTransfer = async (
  client: SigningStargateClient,
  sender: string,
  recipient: string,
  amount: string,
  currency: IbcCurrency,
) => {
  // FIXME - no account here when the address does not have any native tokens for the chain?
  //  e.g. testing w/ Celestia Mocha-4 with an address that doesn't have any TIA on mocha.
  const account = await client.getAccount(sender);
  if (!account) {
    throw new Error("Failed to get account from Keplr wallet.");
  }

  const memo = JSON.stringify({ rollupDepositAddress: recipient });

  // TODO - does the fee need to be configurable in the ui?
  const feeDenom = currency.coinMinimalDenom;
  const fee = {
    amount: [
      {
        denom: feeDenom,
        amount: "0",
      },
    ],
    gas: "350000",
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
      timeoutTimestamp: nowPlusMinutesInNano(10),
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

/**
 * Gets the balance for a given address and currency on an IBC chain using Cosmos SDK client.
 */
export const getBalanceFromChain = async (
  chainInfo: CosmosChainInfo,
  currency: IbcCurrency,
  address: string,
): Promise<string> => {
  const client = await osmosis.ClientFactory.createRPCQueryClient({
    rpcEndpoint: chainInfo.rpc,
  });

  try {
    // query balance using bank module
    const balance = await client.cosmos.bank.v1beta1.balance({
      address,
      denom: currency.coinMinimalDenom,
    });

    if (!balance?.balance) {
      return `0 ${currency.coinDenom}`;
    }

    // convert to display amount using decimal places
    const amount = Decimal.fromAtomics(
      balance.balance.amount,
      currency.coinDecimals,
    );
    return `${amount.toString()} ${currency.coinDenom}`;
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    throw error;
  }
};
