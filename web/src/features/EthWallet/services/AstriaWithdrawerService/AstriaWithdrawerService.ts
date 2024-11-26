import GenericContractService from "features/EthWallet/services/GenericContractService";
import type { Config } from "@wagmi/core";
import { type Abi, type Address, parseUnits } from "viem";

export class AstriaWithdrawerService extends GenericContractService {
  protected static override ABI = [
    {
      type: "function",
      name: "withdrawToIbcChain",
      inputs: [
        { type: "string", name: "destinationChainAddress" },
        { type: "string", name: "memo" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
  ] as const satisfies Abi;

  public static override getInstance(
    wagmiConfig: Config,
    contractAddress: Address,
  ): AstriaWithdrawerService {
    /* biome-ignore lint/complexity/noThisInStatic: */
    return super.getInstance(
      wagmiConfig,
      contractAddress,
    ) as AstriaWithdrawerService;
  }

  async withdrawToIbcChain(
    chainId: number,
    destinationChainAddress: string,
    amount: string,
    amountDenom: number,
    fee: string,
    memo: string,
  ): Promise<`0x${string}`> {
    const amountWei = parseUnits(amount, amountDenom);
    const feeWei = BigInt(fee);
    // need to send enough to cover fees
    const totalAmount = amountWei + feeWei;
    return this.writeContractMethod(
      chainId,
      "withdrawToIbcChain",
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
  protected static override ABI = [
    {
      type: "function",
      name: "withdrawToIbcChain",
      inputs: [
        { type: "uint256", name: "amount" },
        { type: "string", name: "destinationChainAddress" },
        { type: "string", name: "memo" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "balanceOf",
      inputs: [{ type: "address", name: "owner" }],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
    },
  ] as const satisfies Abi;

  public static override getInstance(
    wagmiConfig: Config,
    contractAddress: Address,
  ): AstriaErc20WithdrawerService {
    /* biome-ignore lint/complexity/noThisInStatic: */
    return super.getInstance(
      wagmiConfig,
      contractAddress,
    ) as AstriaErc20WithdrawerService;
  }

  async withdrawToIbcChain(
    chainId: number,
    destinationChainAddress: string,
    amount: string,
    amountDenom: number,
    fee: string,
    memo: string,
  ): Promise<`0x${string}`> {
    const amountBaseUnits = parseUnits(amount, amountDenom);
    const feeWei = BigInt(fee);
    return this.writeContractMethod(
      chainId,
      "withdrawToIbcChain",
      [amountBaseUnits, destinationChainAddress, memo],
      feeWei,
    );
  }

  async getBalance(chainId: number, address: string): Promise<bigint> {
    return this.readContractMethod(chainId, "balanceOf", [address]);
  }
}

// Helper function to get AstriaWithdrawerService instance
export const getAstriaWithdrawerService = (
  wagmiConfig: Config,
  contractAddress: Address,
  isErc20 = false,
): AstriaWithdrawerService | AstriaErc20WithdrawerService => {
  if (isErc20) {
    return AstriaErc20WithdrawerService.getInstance(
      wagmiConfig,
      contractAddress,
    ) as AstriaErc20WithdrawerService;
  }
  return AstriaWithdrawerService.getInstance(
    wagmiConfig,
    contractAddress,
  ) as AstriaWithdrawerService;
};
