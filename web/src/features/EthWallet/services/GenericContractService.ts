import { ethers } from "ethers";

export default class GenericContractService {
  protected static instances: Map<string, GenericContractService> = new Map();
  protected static ABI: ethers.InterfaceAbi;
  protected walletProvider: ethers.BrowserProvider;
  protected readonly contractAddress: string;
  protected readonly abi: ethers.InterfaceAbi;
  protected contractPromise: Promise<ethers.Contract> | null = null;

  protected constructor(
    walletProvider: ethers.Eip1193Provider,
    contractAddress: string,
  ) {
    this.walletProvider = new ethers.BrowserProvider(walletProvider);
    this.contractAddress = contractAddress;
    this.abi = (this.constructor as typeof GenericContractService).ABI;
  }

  protected static getInstanceKey(contractAddress: string): string {
    /* biome-ignore lint/complexity/noThisInStatic: */
    return `${this.name}-${contractAddress}`;
  }

  public static getInstance(
    provider: ethers.Eip1193Provider,
    contractAddress: string,
  ): GenericContractService {
    /* biome-ignore lint/complexity/noThisInStatic: */
    const key = this.getInstanceKey(contractAddress);
    /* biome-ignore lint/complexity/noThisInStatic: */
    let instance = this.instances.get(key);

    if (!instance) {
      /* biome-ignore lint/complexity/noThisInStatic: */
      instance = new this(provider, contractAddress);
      /* biome-ignore lint/complexity/noThisInStatic: */
      this.instances.set(key, instance);
    } else {
      instance.updateProvider(provider);
    }

    return instance;
  }

  protected updateProvider(provider: ethers.Eip1193Provider): void {
    this.walletProvider = new ethers.BrowserProvider(provider);
    this.contractPromise = null;
  }

  protected async getContract(address: string): Promise<ethers.Contract> {
    if (!this.contractPromise) {
      this.contractPromise = (async () => {
        try {
          const signer = await this.walletProvider.getSigner(address);
          return new ethers.Contract(this.contractAddress, this.abi, signer);
        } catch (error) {
          this.contractPromise = null;
          throw error;
        }
      })();
    }
    return this.contractPromise;
  }

  protected async callContractMethod(
    methodName: string,
    fromAddress: string,
    args: unknown[],
    value?: ethers.BigNumberish,
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const contract = await this.getContract(fromAddress);
      const method = contract[methodName];
      if (!method) {
        throw new Error(`Method ${methodName} not found in contract`);
      }
      return method(...args, { value });
    } catch (error) {
      console.error(`Error in ${methodName}:`, error);
      throw error;
    }
  }
}
