import { ethers } from "ethers";

const WITHDRAWER_CONTRACT_ADDRESS = "0xA58639fB5458e65E4fA917FF951C390292C24A15";

const ABI = [
  "function withdrawToSequencer(string destinationChainAddress) payable",
  "function withdrawToIbcChain(string destinationChainAddress, string memo) payable"
];

/**
 * Service for interacting with the Astria withdrawer contract.
 *
 * This service is used to withdraw funds from the Astria EVM to the Sequencer or to an IBC chain.
 */
export class AstriaWithdrawerService {
  private walletProvider: ethers.BrowserProvider;
  private readonly fromAddress: string;
  private contractPromise: Promise<ethers.Contract> | null = null;

  constructor(walletProvider: EIP1193Provider, fromAddress: string) {
    this.walletProvider = new ethers.BrowserProvider(walletProvider);
    this.fromAddress = fromAddress;
  }

  private async getContract(): Promise<ethers.Contract> {
    if (!this.contractPromise) {
      this.contractPromise = (async () => {
        try {
          const signer = await this.walletProvider.getSigner(this.fromAddress);
          return new ethers.Contract(WITHDRAWER_CONTRACT_ADDRESS, ABI, signer);
        } catch (error) {
          this.contractPromise = null;
          throw error;
        }
      })();
    }
    return this.contractPromise;
  }

  async withdrawToSequencer(destinationChainAddress: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    try {
      const amountWei = ethers.parseEther(amount);
      const contract = await this.getContract();
      return contract.withdrawToSequencer(destinationChainAddress, { value: amountWei });
    } catch (error) {
      console.error("Error in withdrawToSequencer:", error);
      throw error;
    }
  }

  async withdrawToIbcChain(destinationChainAddress: string, amount: string, memo: string): Promise<ethers.ContractTransactionResponse> {
    try {
      const amountWei = ethers.parseEther(amount);
      const contract = await this.getContract();
      return contract.withdrawToIbcChain(destinationChainAddress, memo, { value: amountWei });
    } catch (error) {
      console.error("Error in withdrawToIbcChain:", error);
      throw error;
    }
  }
}

export const getAstriaWithdrawerService = (provider: ethers.Eip1193Provider, address: string): AstriaWithdrawerService => {
  return new AstriaWithdrawerService(provider, address);
};