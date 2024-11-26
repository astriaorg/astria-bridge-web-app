import { type Config, getPublicClient, getWalletClient } from "@wagmi/core";
import { parseUnits } from "viem";
import {
  getAstriaWithdrawerService,
  AstriaWithdrawerService,
  AstriaErc20WithdrawerService,
} from "./AstriaWithdrawerService";
import { sepolia } from "wagmi/chains";

// Mock wagmi core
jest.mock("@wagmi/core", () => ({
  getWalletClient: jest.fn(),
  getPublicClient: jest.fn(),
}));

describe("AstriaWithdrawerService and AstriaErc20WithdrawerService", () => {
  const mockContractAddress =
    "0x1234567890123456789012345678901234567890" as const;
  const mockDestinationAddress =
    "celestia1m0ksdjl2p5nzhqy3p47fksv52at3ln885xvl96";
  const mockAmount = "1.0";
  const mockAmountDenom = 18;
  const mockFee = "10000000000000000";
  const mockMemo = "Test memo";
  const mockTxHash = "0xabcdef0123456789" as const;

  const mockWalletClient = {
    writeContract: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockTxHash)),
  };

  const mockPublicClient = {
    readContract: jest.fn().mockImplementation(() => Promise.resolve(1000000)),
  };

  const mockWagmiConfig = {
    chains: [sepolia],
    transports: {
      [sepolia.id]: "https://sepolia.example.com",
    },
  } as unknown as Config;

  beforeEach(() => {
    jest.resetAllMocks();
    (getWalletClient as jest.Mock).mockResolvedValue(mockWalletClient);
    (getPublicClient as jest.Mock).mockReturnValue(mockPublicClient);
  });

  describe("AstriaWithdrawerService", () => {
    it("should create a singleton instance", () => {
      const service1 = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      );
      const service2 = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      );

      expect(service1).toBe(service2);
      expect(service1).toBeInstanceOf(AstriaWithdrawerService);
    });

    it("should call withdrawToIbcChain with correct parameters", async () => {
      const service = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      ) as AstriaWithdrawerService;

      const result = await service.withdrawToIbcChain(
        420,
        mockDestinationAddress,
        mockAmount,
        mockAmountDenom,
        mockFee,
        mockMemo,
      );

      const totalAmount =
        parseUnits(mockAmount, mockAmountDenom) + BigInt(mockFee);

      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: expect.any(Array),
        functionName: "withdrawToIbcChain",
        args: [mockDestinationAddress, mockMemo],
        value: totalAmount,
      });

      expect(result).toBe(mockTxHash);
    });
  });

  describe("AstriaErc20WithdrawerService", () => {
    it("should create a singleton instance", () => {
      const service1 = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
        true,
      );
      const service2 = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
        true,
      );

      expect(service1).toBe(service2);
      expect(service1).toBeInstanceOf(AstriaErc20WithdrawerService);
    });

    it("should call withdrawToIbcChain for erc20 with correct parameters", async () => {
      const service = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;

      const result = await service.withdrawToIbcChain(
        420,
        mockDestinationAddress,
        mockAmount,
        mockAmountDenom,
        mockFee,
        mockMemo,
      );

      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: expect.any(Array),
        functionName: "withdrawToIbcChain",
        args: [
          parseUnits(mockAmount, mockAmountDenom),
          mockDestinationAddress,
          mockMemo,
        ],
        value: BigInt(mockFee),
      });

      expect(result).toBe(mockTxHash);
    });

    it("should get balance correctly", async () => {
      const mockAddress = "0x1234567890123456789012345678901234567890";

      const service = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;

      const balance = await service.getBalance(420, mockAddress);

      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: expect.any(Array),
        functionName: "balanceOf",
        args: [mockAddress],
      });

      expect(balance).toBe(1000000);
    });
  });

  describe("getAstriaWithdrawerService", () => {
    it("should return AstriaWithdrawerService when isErc20 is false", () => {
      const service = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
        false,
      );
      expect(service).toBeInstanceOf(AstriaWithdrawerService);
    });

    it("should return AstriaErc20WithdrawerService when isErc20 is true", () => {
      const service = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
        true,
      );
      expect(service).toBeInstanceOf(AstriaErc20WithdrawerService);
    });
  });

  describe("error handling", () => {
    it("should throw when wallet client is not available", async () => {
      (getWalletClient as jest.Mock).mockResolvedValue(null);

      const service = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      ) as AstriaWithdrawerService;

      await expect(
        service.withdrawToIbcChain(
          420,
          mockDestinationAddress,
          mockAmount,
          mockAmountDenom,
          mockFee,
          mockMemo,
        ),
      ).rejects.toThrow("No wallet client available");
    });

    it("should throw when public client is not available", async () => {
      (getPublicClient as jest.Mock).mockReturnValue(null);

      const service = getAstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;

      await expect(service.getBalance(420, mockContractAddress)).rejects.toThrow(
        "No public client available",
      );
    });
  });
});
