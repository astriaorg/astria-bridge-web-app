import type { Abi, Address, Hash } from "viem";
import { type Config, getPublicClient, getWalletClient } from "@wagmi/core";

/**
 * Generic base class for contract services that provides common functionality
 * for interacting with smart contracts using Viem
 */
export default class GenericContractService {
  protected static instances: Map<string, GenericContractService> = new Map();
  protected static ABI: Abi;
  protected readonly contractAddress: Address;
  protected readonly abi: Abi;
  protected readonly wagmiConfig: Config;

  protected constructor(wagmiConfig: Config, contractAddress: Address) {
    this.wagmiConfig = wagmiConfig;
    this.contractAddress = contractAddress;
    this.abi = (this.constructor as typeof GenericContractService).ABI;
  }

  protected static getInstanceKey(contractAddress: string): string {
    /* biome-ignore lint/complexity/noThisInStatic: required for proper class initialization */
    return `${this.name}-${contractAddress}`;
  }

  public static getInstance(
    wagmiConfig: Config,
    contractAddress: Address,
  ): GenericContractService {
    /* biome-ignore lint/complexity/noThisInStatic: required for proper class initialization */
    const key = this.getInstanceKey(contractAddress);
    /* biome-ignore lint/complexity/noThisInStatic: required for proper class initialization */
    let instance = this.instances.get(key);

    if (!instance) {
      /* biome-ignore lint/complexity/noThisInStatic: required for proper class initialization */
      instance = new this(wagmiConfig, contractAddress);
      /* biome-ignore lint/complexity/noThisInStatic: required for proper class initialization */
      this.instances.set(key, instance);
    }

    return instance;
  }

  /**
   * Calls a read-only contract method
   */
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

  /**
   * Calls a contract method that requires a transaction
   */
  protected async writeContractMethod(
    chainId: number,
    methodName: string,
    args: unknown[] = [],
    value?: bigint,
  ): Promise<Hash> {
    console.log(this.wagmiConfig);
    const walletClient = await getWalletClient(this.wagmiConfig, { chainId });
    if (!walletClient) throw new Error("No wallet client available");

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
