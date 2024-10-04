import { ethers } from "ethers";

export class GenericContractService {
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

export class AstriaWithdrawerService extends GenericContractService {
  protected static override ABI: ethers.InterfaceAbi = [
    "function withdrawToSequencer(string destinationChainAddress) payable",
    "function withdrawToIbcChain(string destinationChainAddress, string memo) payable",
  ];

  public static override getInstance(
    provider: ethers.Eip1193Provider,
    contractAddress: string,
  ): AstriaWithdrawerService {
    /* biome-ignore lint/complexity/noThisInStatic: */
    return super.getInstance(
      provider,
      contractAddress,
    ) as AstriaWithdrawerService;
  }

  async withdrawToSequencer(
    fromAddress: string,
    destinationChainAddress: string,
    amount: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const amountWei = ethers.parseEther(amount);
    return this.callContractMethod(
      "withdrawToSequencer",
      fromAddress,
      [destinationChainAddress],
      amountWei,
    );
  }

  async withdrawToIbcChain(
    fromAddress: string,
    destinationChainAddress: string,
    amount: string,
    memo: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const amountWei = ethers.parseEther(amount);
    return this.callContractMethod(
      "withdrawToIbcChain",
      fromAddress,
      [destinationChainAddress, memo],
      amountWei,
    );
  }
}

export class AstriaErc20WithdrawerService extends GenericContractService {
  protected static override ABI: ethers.InterfaceAbi = [
    "function withdrawToSequencer(uint256 amount, string destinationChainAddress) payable",
    "function withdrawToIbcChain(uint256 amount, string destinationChainAddress, string memo) payable",
  ];

  public static override getInstance(
    provider: ethers.Eip1193Provider,
    contractAddress: string,
  ): AstriaErc20WithdrawerService {
    /* biome-ignore lint/complexity/noThisInStatic: */
    return super.getInstance(
      provider,
      contractAddress,
    ) as AstriaErc20WithdrawerService;
  }
  async withdrawToSequencer(
    fromAddress: string,
    destinationChainAddress: string,
    amount: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const amountWei = ethers.parseEther(amount);
    return this.callContractMethod("withdrawToSequencer", fromAddress, [
      amountWei,
      destinationChainAddress,
    ]);
  }

  async withdrawToIbcChain(
    fromAddress: string,
    destinationChainAddress: string,
    amount: string,
    memo: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const amountWei = ethers.parseEther(amount);
    return this.callContractMethod("withdrawToIbcChain", fromAddress, [
      amountWei,
      destinationChainAddress,
      memo,
    ]);
  }
}

// Helper function to get AstriaWithdrawerService instance
export const getAstriaWithdrawerService = (
  provider: ethers.Eip1193Provider,
  contractAddress: string,
  isErc20 = false,
): AstriaWithdrawerService | AstriaErc20WithdrawerService => {
  if (isErc20) {
    return AstriaErc20WithdrawerService.getInstance(
      provider,
      contractAddress,
    ) as AstriaErc20WithdrawerService;
  }
  return AstriaWithdrawerService.getInstance(
    provider,
    contractAddress,
  ) as AstriaWithdrawerService;
};
