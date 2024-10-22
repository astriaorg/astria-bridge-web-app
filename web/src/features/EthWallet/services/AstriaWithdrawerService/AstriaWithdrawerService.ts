import { ethers } from "ethers";
import GenericContractService from "../GenericContractService";

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

/**
 * Service class for interacting with the AstriaErc20Withdrawer contract.
 * This contract extends ERC20, so it has methods like balanceOf
 */
export class AstriaErc20WithdrawerService extends GenericContractService {
  protected static override ABI: ethers.InterfaceAbi = [
    "function withdrawToSequencer(uint256 amount, string destinationChainAddress) payable",
    "function withdrawToIbcChain(uint256 amount, string destinationChainAddress, string memo) payable",
    "function balanceOf(address owner) view returns (uint256)",
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

  async getBalance(
    address: string,
  ): Promise<ethers.ContractTransactionResponse> {
    return this.callContractMethod("balanceOf", address, [address]);
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
