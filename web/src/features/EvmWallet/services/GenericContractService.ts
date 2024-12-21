import { type Config, getPublicClient, getWalletClient } from "@wagmi/core";
import type { Abi, Address, Hash } from "viem";

export class GenericContractService {
  constructor(
    protected readonly wagmiConfig: Config,
    protected readonly contractAddress: Address,
    protected readonly abi: Abi,
  ) {}

  protected async readContractMethod<T>(
    chainId: number,
    methodName: string,
    args: unknown[] = [],
  ): Promise<T> {
    try {
      const publicClient = getPublicClient(this.wagmiConfig, { chainId });
      if (!publicClient) {
        throw new Error("No public client available");
      }
      return (await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: methodName,
        args,
      })) as T;
    } catch (e) {
      console.error(`Error reading contract method ${methodName}:`, e);
      throw e;
    }
  }

  protected async writeContractMethod(
    chainId: number,
    methodName: string,
    args: unknown[] = [],
    value?: bigint,
  ): Promise<Hash> {
    const walletClient = await getWalletClient(this.wagmiConfig, { chainId });
    if (!walletClient) {
      throw new Error("No wallet client available");
    }

    try {
      return await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: methodName,
        args,
        value,
      });
    } catch (e) {
      console.error(`Error in ${methodName}:`, e);
      throw e;
    }
  }
}
