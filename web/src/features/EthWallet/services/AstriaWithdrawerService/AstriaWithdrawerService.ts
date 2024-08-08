import { AbiCoder, ethers } from "ethers";

const WITHDRAWER_CONTRACT_ADDRESS = "0xA58639fB5458e65E4fA917FF951C390292C24A15";

const ABI = [
  {
    name: 'withdrawToSequencer',
    type: 'function',
    inputs: [{ name: 'destinationChainAddress', type: 'string' }],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    name: 'withdrawToIbcChain',
    type: 'function',
    inputs: [
      { name: 'destinationChainAddress', type: 'string' },
      { name: 'memo', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'payable'
  }
];

export class AstriaWithdrawerService {
  private provider: EIP1193Provider;
  private readonly fromAddress: string;

  constructor(provider: EIP1193Provider, fromAddress: string) {
    this.provider = provider;
    this.fromAddress = fromAddress;
  }

  private async sendTransaction(method: string, amount: string, params: any[]): Promise<string> {
    const paramTypes = ABI.find((x) => x.name === method)?.inputs.map((x) => x.type) ?? [];
    const data = AbiCoder.defaultAbiCoder().encode(
      ["string", ...paramTypes],
      [method, ...params],
    );
    console.log(this.fromAddress, WITHDRAWER_CONTRACT_ADDRESS, params, paramTypes, amount);
    console.log({
      fromAddress: this.fromAddress,
      smartContractAddress: WITHDRAWER_CONTRACT_ADDRESS,
      params,
      paramTypes,

    })

    const tx = await this.provider.request({
      method: "eth_sendTransaction",
      params: [{
        from: this.fromAddress,
        to: WITHDRAWER_CONTRACT_ADDRESS,
        data,
        value: ethers.toQuantity(ethers.parseEther(amount)),
      }],
    });

    return tx as string;
  }

  async withdrawToSequencer(destinationChainAddress: string, amount: string): Promise<string> {
    return this.sendTransaction("withdrawToSequencer", amount, [destinationChainAddress]);
  }

  async withdrawToIbcChain(destinationChainAddress: string, amount: string, memo: string): Promise<string> {
    return this.sendTransaction("withdrawToIbcChain", amount, [destinationChainAddress, memo]);
  }
}

export const getAstriaWithdrawerService = (provider: EIP1193Provider, address: string): AstriaWithdrawerService => {
  return new AstriaWithdrawerService(provider, address);
};
