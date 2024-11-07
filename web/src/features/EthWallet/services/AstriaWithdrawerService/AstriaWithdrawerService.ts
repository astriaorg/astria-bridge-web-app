import { ethers } from "ethers";
import GenericContractService from "features/EthWallet/services/GenericContractService";

export class AstriaWithdrawerService extends GenericContractService {
  protected static override ABI: ethers.InterfaceAbi = [
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

  async withdrawToIbcChain(
    fromAddress: string,
    destinationChainAddress: string,
    amount: string,
    amountDenom: number,
    fee: string,
    memo: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const amountWei = ethers.parseUnits(amount, amountDenom);
    const feeWei = BigInt(fee);
    // need to send enough to cover fees
    const totalAmount = amountWei + feeWei;
    return this.callContractMethod(
      "withdrawToIbcChain",
      fromAddress,
      [destinationChainAddress, memo],
      totalAmount,
    );
  }
}

/**
 * Service class for interacting with the AstriaErc20Withdrawer contract.
 * This contract extends ERC20, so it has methods like balanceOf
 */
export class AstriaErc20WithdrawerService extends GenericContractService {
  protected static override ABI: ethers.InterfaceAbi = [
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

  async withdrawToIbcChain(
    fromAddress: string,
    destinationChainAddress: string,
    amount: string,
    amountDenom: number,
    fee: string,
    memo: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const amountBaseUnits = ethers.parseUnits(amount, amountDenom);
    const feeWei = BigInt(fee);
    return this.callContractMethod(
      "withdrawToIbcChain",
      fromAddress,
      [amountBaseUnits, destinationChainAddress, memo],
      feeWei,
    );
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
