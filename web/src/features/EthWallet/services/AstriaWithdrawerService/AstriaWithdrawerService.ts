import { ethers } from "ethers";

const WITHDRAWER_CONTRACT_ADDRESS = "0xA58639fB5458e65E4fA917FF951C390292C24A15";

const ABI = [
  "function withdrawToSequencer(string destinationChainAddress) payable",
  "function withdrawToIbcChain(string destinationChainAddress, string memo) payable"
];

export class AstriaWithdrawerService {
  private provider: ethers.BrowserProvider;
  private readonly fromAddress: string;

  constructor(provider: EIP1193Provider, fromAddress: string) {
    this.provider = new ethers.BrowserProvider(provider);
    this.fromAddress = fromAddress;
  }

  async getContract(): Promise<ethers.Contract> {
    const signer = await this.provider.getSigner(this.fromAddress);
    return new ethers.Contract(WITHDRAWER_CONTRACT_ADDRESS, ABI, signer);
  }

  async withdrawToSequencer(destinationChainAddress: string, amount: string): Promise<ethers.ContractTransaction> {
    const amountWei = ethers.parseEther(amount);
    const contract = await this.getContract();
    return contract.withdrawToSequencer(destinationChainAddress, { value: amountWei });
  }

  async withdrawToIbcChain(destinationChainAddress: string, amount: string, memo: string): Promise<ethers.ContractTransaction> {
    const amountWei = ethers.parseEther(amount);
    const contract = await this.getContract();
    return contract.withdrawToIbcChain(destinationChainAddress, memo, { value: amountWei });
  }
}

export const getAstriaWithdrawerService = (provider: EIP1193Provider, address: string): AstriaWithdrawerService => {
  return new AstriaWithdrawerService(provider, address);
};