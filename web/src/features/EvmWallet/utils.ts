import { type Config, getConnectorClient } from "@wagmi/core";
import { BrowserProvider } from "ethers";
import type { Account, Chain, Client, Transport } from "viem";

export function clientTorProvider(client: Client<Transport, Chain, Account>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new BrowserProvider(transport, network);
}

/** Action to convert a viem Wallet Client to a BrowserProvider. */
export async function getEthersProvider(
  config: Config,
  { chainId }: { chainId?: number } = {},
) {
  const client = await getConnectorClient(config, { chainId });
  return clientTorProvider(client);
}
