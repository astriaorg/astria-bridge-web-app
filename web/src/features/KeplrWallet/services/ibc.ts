import Long from "long";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { Dec } from "@keplr-wallet/unit";
import type { IbcChainInfo, IbcCurrency } from "config";
import type { Keplr } from "@keplr-wallet/types";
import type { Key } from "@keplr-wallet/types/src/wallet/keplr";

/**
 * Get the Keplr wallet object from the browser window.
 * Requires the Keplr extension to be installed.
 */
export function getKeplrFromWindow(): Keplr {
  const keplr = window.keplr;
  if (!keplr) {
    throw new Error("Keplr extension not installed");
  }
  return keplr;
}

/**
 * Get the key from the Keplr wallet for the selected chain.
 * @param {string} chainId - The chain ID to get the key for.
 */
async function getKeyFromKeplr(chainId: string): Promise<Key> {
  const keplr = getKeplrFromWindow();
  const key = await keplr.getKey(chainId);
  if (!key) {
    throw new Error("Failed to get key from Keplr wallet.");
  }
  return key;
}

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
  const keplr = getKeplrFromWindow();
  const offlineSigner = keplr.getOfflineSignerOnlyAmino(
    selectedIbcChain.chainId,
  );

  const client = await SigningStargateClient.connectWithSigner(
    selectedIbcChain.rpc,
    offlineSigner,
  );

  const key = await getKeyFromKeplr(selectedIbcChain.chainId);
  if (key.bech32Address !== sender) {
    throw new Error("Sender address does not match Keplr wallet address.");
  }

  // FIXME - no account here when the address does not have any native tokens for the chain?
  //  e.g. testing w/ Celestia Mocha-4 with an address that doesn't have any TIA on mocha.
  const account = await client.getAccount(key.bech32Address);
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
      // 10 minutes from now, in nanoseconds
      timeoutTimestamp: BigInt(Date.now() + 600_000) * BigInt(1_000_000),
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
 * Get the balance of the selected currency from the Keplr wallet.
 * @param selectedIbcChain
 * @param selectedCurrency
 */
export const getBalanceFromKeplr = async (
  selectedIbcChain: IbcChainInfo,
  selectedCurrency: IbcCurrency,
): Promise<string> => {
  const key = await getKeyFromKeplr(selectedIbcChain.chainId);
  const client = await StargateClient.connect(selectedIbcChain.rpc);

  const balance = await client.getBalance(
    key.bech32Address,
    selectedCurrency.coinMinimalDenom,
  );

  const { coinDenom, coinDecimals } = selectedCurrency;

  if (!balance) {
    return `0 ${coinDenom}`;
  }

  const amount = new Dec(balance.amount, coinDecimals);
  return `${amount.toString(2)} ${coinDenom}`;
};

/**
 * Get the address from the Keplr wallet for the selected chain.
 * @param chainId
 */
export const getAddressFromKeplr = async (chainId: string): Promise<string> => {
  const key = await getKeyFromKeplr(chainId);
  return key.bech32Address;
};
