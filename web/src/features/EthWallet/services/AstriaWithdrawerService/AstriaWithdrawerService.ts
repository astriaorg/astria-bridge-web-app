import { ethers } from "ethers";
import { getEnvVariable } from "utils";

const ABI = [
  "function withdrawToSequencer(string destinationChainAddress) payable",
  "function withdrawToIbcChain(string destinationChainAddress, string memo) payable",
];

/**
 * Service for interacting with the Astria withdrawer contract.
 *
 * This service is used to withdraw funds from the Astria EVM to the Sequencer or to an IBC chain.
 */
export class AstriaWithdrawerService {
  private static instance: AstriaWithdrawerService | null = null;
  private walletProvider: ethers.BrowserProvider;
  private readonly contractAddress: string;
  private contractPromise: Promise<ethers.Contract> | null = null;

  private constructor(walletProvider: ethers.Eip1193Provider) {
    this.walletProvider = new ethers.BrowserProvider(walletProvider);
    try {
      this.contractAddress = getEnvVariable(
        "REACT_APP_EVM_WITHDRAWER_CONTRACT_ADDRESS",
      );
    } catch (error) {
      console.error(
        "REACT_APP_EVM_WITHDRAWER_CONTRACT_ADDRESS not set:",
        error,
      );
      throw error;
    }
  }

  /**
   * Get the singleton instance of the AstriaWithdrawerService.
   * If a provider is supplied, it will be used to create a new instance.
   * @param provider
   */
  public static getInstance(
    provider?: ethers.Eip1193Provider,
  ): AstriaWithdrawerService {
    if (!AstriaWithdrawerService.instance) {
      if (!provider) {
        throw new Error(
          "Provider must be supplied when creating the service instance",
        );
      }
      AstriaWithdrawerService.instance = new AstriaWithdrawerService(provider);
    } else if (provider) {
      // update the provider if one is supplied
      AstriaWithdrawerService.instance.updateProvider(provider);
    }
    return AstriaWithdrawerService.instance;
  }

  private updateProvider(provider: ethers.Eip1193Provider): void {
    this.walletProvider = new ethers.BrowserProvider(provider);
    // reset the contract promise to force a new contract creation
    this.contractPromise = null;
  }

  /**
   * Get the withdrawer contract instance.
   * Caches the contract instance to avoid unnecessary contract creation.
   * @param address
   * @private
   */
  private async getContract(address: string): Promise<ethers.Contract> {
    if (!this.contractPromise) {
      this.contractPromise = (async () => {
        try {
          const signer = await this.walletProvider.getSigner(address);
          return new ethers.Contract(this.contractAddress, ABI, signer);
        } catch (error) {
          this.contractPromise = null;
          throw error;
        }
      })();
    }
    return this.contractPromise;
  }

  async withdrawToSequencer(
    fromAddress: string,
    destinationChainAddress: string,
    amount: string,
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const amountWei = ethers.parseEther(amount);
      const contract = await this.getContract(fromAddress);
      return contract.withdrawToSequencer(destinationChainAddress, {
        value: amountWei,
      });
    } catch (error) {
      console.error("Error in withdrawToSequencer:", error);
      throw error;
    }
  }

  async withdrawToIbcChain(
    fromAddress: string,
    destinationChainAddress: string,
    amount: string,
    memo: string,
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const amountWei = ethers.parseEther(amount);
      const contract = await this.getContract(fromAddress);
      return contract.withdrawToIbcChain(destinationChainAddress, memo, {
        value: amountWei,
      });
    } catch (error) {
      console.error("Error in withdrawToIbcChain:", error);
      throw error;
    }
  }
}

/**
 * Get the singleton instance of the AstriaWithdrawerService.
 * @param provider
 */
export const getAstriaWithdrawerService = (
  provider?: ethers.Eip1193Provider,
): AstriaWithdrawerService => {
  return AstriaWithdrawerService.getInstance(provider);
};
