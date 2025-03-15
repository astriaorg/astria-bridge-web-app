import { type Config, getPublicClient, getWalletClient } from "@wagmi/core";
import { parseUnits } from "viem";
import { sepolia } from "wagmi/chains";

import { GenericContractService } from "../GenericContractService";
import {
  AstriaErc20WithdrawerService,
  AstriaWithdrawerService,
  createWithdrawerService,
} from "./AstriaWithdrawerService";

// Mock wagmi core
jest.mock("@wagmi/core", () => ({
  getWalletClient: jest.fn(),
  getPublicClient: jest.fn(),
}));

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
  writeContract: jest.fn().mockResolvedValue(mockTxHash),
};

const mockPublicClient = {
  readContract: jest.fn().mockResolvedValue(1000000n),
};

const mockWagmiConfig = {
  chains: [sepolia],
  transports: {
    [sepolia.id]: "https://sepolia.example.com",
  },
} as unknown as Config;

describe("GenericContractService", () => {
  const mockAbi = [
    {
      type: "function",
      name: "testMethod",
      inputs: [],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
    },
  ] as const;

  beforeEach(() => {
    jest.resetAllMocks();

    mockWalletClient.writeContract.mockReturnValue(Promise.resolve(mockTxHash));
    mockPublicClient.readContract.mockReturnValue(Promise.resolve(1000000));

    (getWalletClient as jest.Mock).mockResolvedValue(mockWalletClient);
    (getPublicClient as jest.Mock).mockReturnValue(mockPublicClient);
  });

  describe("readContractMethod", () => {
    it("should call readContract with correct parameters", async () => {
      const service = new GenericContractService(
        mockWagmiConfig,
        mockContractAddress,
        mockAbi,
      );

      // biome-ignore lint/complexity/useLiteralKeys: testing private method
      await service["readContractMethod"](1, "testMethod", []);

      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: mockAbi,
        functionName: "testMethod",
        args: [],
      });
    });

    it("should throw when public client is not available", async () => {
      (getPublicClient as jest.Mock).mockReturnValue(null);
      const service = new GenericContractService(
        mockWagmiConfig,
        mockContractAddress,
        mockAbi,
      );

      await expect(
        // biome-ignore lint/complexity/useLiteralKeys: testing private method
        service["readContractMethod"](1, "testMethod", []),
      ).rejects.toThrow("No public client available");
    });

    it("should propagate errors from readContract", async () => {
      const service = new GenericContractService(
        mockWagmiConfig,
        mockContractAddress,
        mockAbi,
      );
      const errorMessage = "Read contract error";
      mockPublicClient.readContract.mockRejectedValue(new Error(errorMessage));

      await expect(
        // biome-ignore lint/complexity/useLiteralKeys: testing private method
        service["readContractMethod"](1, "testMethod", []),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe("writeContractMethod", () => {
    it("should call writeContract with correct parameters", async () => {
      const service = new GenericContractService(
        mockWagmiConfig,
        mockContractAddress,
        mockAbi,
      );

      // biome-ignore lint/complexity/useLiteralKeys: testing private method
      await service["writeContractMethod"](1, "testMethod", [], 100n);

      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: mockAbi,
        functionName: "testMethod",
        args: [],
        value: 100n,
      });
    });

    it("should throw when wallet client is not available", async () => {
      (getWalletClient as jest.Mock).mockResolvedValue(null);
      const service = new GenericContractService(
        mockWagmiConfig,
        mockContractAddress,
        mockAbi,
      );

      await expect(
        // biome-ignore lint/complexity/useLiteralKeys: testing private method
        service["writeContractMethod"](1, "testMethod", []),
      ).rejects.toThrow("No wallet client available");
    });

    it("should propagate errors from writeContract", async () => {
      const service = new GenericContractService(
        mockWagmiConfig,
        mockContractAddress,
        mockAbi,
      );
      const errorMessage = "Write contract error";
      mockWalletClient.writeContract.mockRejectedValue(new Error(errorMessage));

      await expect(
        // biome-ignore lint/complexity/useLiteralKeys: testing private method
        service["writeContractMethod"](1, "testMethod", []),
      ).rejects.toThrow(errorMessage);
    });
  });
});

describe("AstriaWithdrawerService", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockWalletClient.writeContract.mockReturnValue(Promise.resolve(mockTxHash));
    mockPublicClient.readContract.mockReturnValue(Promise.resolve(1000000));

    (getWalletClient as jest.Mock).mockResolvedValue(mockWalletClient);
    (getPublicClient as jest.Mock).mockReturnValue(mockPublicClient);
  });

  describe("withdrawToIbcChain", () => {
    it("should call writeContractMethod with correct parameters", async () => {
      const service = new AstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      );
      const writeContractMethodSpy = jest.spyOn(
        // biome-ignore lint/suspicious/noExplicitAny: This is a test mock
        service as any,
        "writeContractMethod",
      );

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

      expect(writeContractMethodSpy).toHaveBeenCalledWith(
        420,
        "withdrawToIbcChain",
        [mockDestinationAddress, mockMemo],
        totalAmount,
      );
      expect(result).toBe(mockTxHash);
    });

    it("should handle withdrawal errors", async () => {
      const service = new AstriaWithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      );
      const errorMessage = "Withdrawal failed";
      jest
        // biome-ignore lint/suspicious/noExplicitAny: This is a test mock
        .spyOn(service as any, "writeContractMethod")
        .mockRejectedValue(new Error(errorMessage));

      await expect(
        service.withdrawToIbcChain(
          420,
          mockDestinationAddress,
          mockAmount,
          mockAmountDenom,
          mockFee,
          mockMemo,
        ),
      ).rejects.toThrow(errorMessage);
    });
  });
});

describe("AstriaErc20WithdrawerService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockWalletClient.writeContract.mockReturnValue(Promise.resolve(mockTxHash));
    mockPublicClient.readContract.mockReturnValue(Promise.resolve(1000000));
    (getWalletClient as jest.Mock).mockResolvedValue(mockWalletClient);
    (getPublicClient as jest.Mock).mockReturnValue(mockPublicClient);
  });

  describe("withdrawToIbcChain", () => {
    it("should call writeContractMethod with correct parameters", async () => {
      const service = new AstriaErc20WithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      );
      const writeContractMethodSpy = jest.spyOn(
        // biome-ignore lint/suspicious/noExplicitAny: This is a test mock
        service as any,
        "writeContractMethod",
      );

      const result = await service.withdrawToIbcChain(
        420,
        mockDestinationAddress,
        mockAmount,
        mockAmountDenom,
        mockFee,
        mockMemo,
      );

      const amountBaseUnits = parseUnits(mockAmount, mockAmountDenom);
      const feeWei = BigInt(mockFee);

      expect(writeContractMethodSpy).toHaveBeenCalledWith(
        420,
        "withdrawToIbcChain",
        [amountBaseUnits, mockDestinationAddress, mockMemo],
        feeWei,
      );
      expect(result).toBe(mockTxHash);
    });

    it("should handle withdrawal errors", async () => {
      const service = new AstriaErc20WithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      );
      const errorMessage = "ERC20 withdrawal failed";
      jest
        // biome-ignore lint/suspicious/noExplicitAny: This is a test mock
        .spyOn(service as any, "writeContractMethod")
        .mockRejectedValue(new Error(errorMessage));

      await expect(
        service.withdrawToIbcChain(
          420,
          mockDestinationAddress,
          mockAmount,
          mockAmountDenom,
          mockFee,
          mockMemo,
        ),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe("getBalance", () => {
    it("should call readContractMethod with correct parameters", async () => {
      const service = new AstriaErc20WithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      );
      const readContractMethodSpy = jest.spyOn(
        // biome-ignore lint/suspicious/noExplicitAny: This is a test mock
        service as any,
        "readContractMethod",
      );
      const mockAddress = "0x1234567890123456789012345678901234567890";

      await service.getBalance(420, mockAddress);

      expect(readContractMethodSpy).toHaveBeenCalledWith(420, "balanceOf", [
        mockAddress,
      ]);
    });

    it("should handle balance check errors", async () => {
      const service = new AstriaErc20WithdrawerService(
        mockWagmiConfig,
        mockContractAddress,
      );
      const errorMessage = "Balance check failed";
      jest
        // biome-ignore lint/suspicious/noExplicitAny: This is a test mock
        .spyOn(service as any, "readContractMethod")
        .mockRejectedValue(new Error(errorMessage));
      const mockAddress = "0x1234567890123456789012345678901234567890";

      await expect(service.getBalance(420, mockAddress)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});

describe("Factory Function", () => {
  it("should create AstriaWithdrawerService when isErc20 is false", () => {
    const service = createWithdrawerService(
      mockWagmiConfig,
      mockContractAddress,
      false,
    );
    expect(service).toBeInstanceOf(AstriaWithdrawerService);
  });

  it("should create AstriaErc20WithdrawerService when isErc20 is true", () => {
    const service = createWithdrawerService(
      mockWagmiConfig,
      mockContractAddress,
      true,
    );
    expect(service).toBeInstanceOf(AstriaErc20WithdrawerService);
  });

  it("should default to AstriaWithdrawerService when isErc20 is not provided", () => {
    const service = createWithdrawerService(
      mockWagmiConfig,
      mockContractAddress,
    );
    expect(service).toBeInstanceOf(AstriaWithdrawerService);
  });
});
