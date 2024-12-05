import type { Config } from "@wagmi/core";
import { type Abi, type Address, parseUnits } from "viem";
import { GenericContractService } from "../GenericContractService.ts";

// AstriaWithdrawerService.ts
export class AstriaWithdrawerService extends GenericContractService {
  private static readonly ABI = [
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
  ] as const;

  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, AstriaWithdrawerService.ABI);
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
    const totalAmount = amountWei + feeWei;
    return this.writeContractMethod(
      chainId,
      "withdrawToIbcChain",
      [destinationChainAddress, memo],
      totalAmount,
    );
  }
}

// AstriaErc20WithdrawerService.ts
export class AstriaErc20WithdrawerService extends GenericContractService {
  private static readonly ABI = [
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

  constructor(wagmiConfig: Config, contractAddress: Address) {
    super(wagmiConfig, contractAddress, AstriaErc20WithdrawerService.ABI);
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

export function createWithdrawerService(
  wagmiConfig: Config,
  contractAddress: Address,
  isErc20 = false,
): AstriaWithdrawerService | AstriaErc20WithdrawerService {
  return isErc20
    ? new AstriaErc20WithdrawerService(wagmiConfig, contractAddress)
    : new AstriaWithdrawerService(wagmiConfig, contractAddress);
}
