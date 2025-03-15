import { ethers } from "ethers";
import {
  getAstriaWithdrawerService,
  AstriaWithdrawerService,
  AstriaErc20WithdrawerService,
} from "./AstriaWithdrawerService";

jest.mock("ethers");

describe("AstriaWithdrawerService and AstriaErc20WithdrawerService", () => {
  const mockContractAddress = "0x1234567890123456789012345678901234567890";
  const mockFromAddress = "0x9876543210987654321098765432109876543210";
  const mockDestinationAddress =
    "celestia1m0ksdjl2p5nzhqy3p47fksv52at3ln885xvl96";
  const mockAmount = "1.0";
  const mockAmountDenom = 18;
  const mockFee: string = "10000000000000000";
  const mockMemo = "Test memo";

  let mockProvider: jest.Mocked<ethers.BrowserProvider>;
  let mockSigner: jest.Mocked<ethers.JsonRpcSigner>;
  let mockContract: jest.Mocked<ethers.Contract>;

  beforeEach(() => {
    jest.resetAllMocks();

    mockProvider = {
      getSigner: jest.fn(),
    } as unknown as jest.Mocked<ethers.BrowserProvider>;

    mockSigner = {} as jest.Mocked<ethers.JsonRpcSigner>;

    mockContract = {
      withdrawToIbcChain: jest.fn(),
    } as unknown as jest.Mocked<ethers.Contract>;

    (ethers.BrowserProvider as jest.Mock).mockReturnValue(mockProvider);
    mockProvider.getSigner.mockResolvedValue(mockSigner);
    (ethers.Contract as jest.Mock).mockReturnValue(mockContract);
    (ethers.parseUnits as jest.Mock).mockImplementation((amount, decimals) => {
      // Create a number that would represent the amount in wei
      const [whole, decimal = ""] = amount.split(".");
      const paddedDecimal = decimal.padEnd(decimals, "0");
      const fullNumber = whole + paddedDecimal;
      // Return an object that mimics ethers BigNumber with toString
      return BigInt(fullNumber.padEnd(decimals + whole.length, "0"));
    });
  });

  describe("AstriaWithdrawerService", () => {
    it("should create a singleton instance", () => {
      const service1 = getAstriaWithdrawerService(
        {} as ethers.BrowserProvider,
        mockContractAddress,
      );
      const service2 = getAstriaWithdrawerService(
        {} as ethers.BrowserProvider,
        mockContractAddress,
      );

      expect(service1).toBe(service2);
      expect(service1).toBeInstanceOf(AstriaWithdrawerService);
    });

    it("should update provider when a new one is supplied", () => {
      const initialProvider = {} as ethers.BrowserProvider;
      const newProvider = {} as ethers.BrowserProvider;

      const service1 = getAstriaWithdrawerService(
        initialProvider,
        mockContractAddress,
      );
      const service2 = getAstriaWithdrawerService(
        newProvider,
        mockContractAddress,
      );

      expect(service1).toBe(service2);
    });

    it("should call withdrawToIbcChain with correct parameters", async () => {
      const provider = new ethers.BrowserProvider({} as ethers.Eip1193Provider);

      const service = getAstriaWithdrawerService(
        provider,
        mockContractAddress,
      ) as AstriaWithdrawerService;

      await service.withdrawToIbcChain(
        mockFromAddress,
        mockDestinationAddress,
        mockAmount,
        mockAmountDenom,
        mockFee,
        mockMemo,
      );

      const total =
        ethers.parseUnits(mockAmount, mockAmountDenom) + BigInt(mockFee);

      expect(mockContract.withdrawToIbcChain).toHaveBeenCalledWith(
        mockDestinationAddress,
        mockMemo,
        { value: total },
      );
    });
  });

  describe("AstriaErc20WithdrawerService", () => {
    it("should create a singleton instance", () => {
      const service1 = getAstriaWithdrawerService(
        {} as ethers.BrowserProvider,
        mockContractAddress,
        true,
      );
      const service2 = getAstriaWithdrawerService(
        {} as ethers.BrowserProvider,
        mockContractAddress,
        true,
      );

      expect(service1).toBe(service2);
      expect(service1).toBeInstanceOf(AstriaErc20WithdrawerService);
    });

    it("should update provider when a new one is supplied", () => {
      const initialProvider = {} as ethers.BrowserProvider;
      const newProvider = {} as ethers.BrowserProvider;

      const service1 = getAstriaWithdrawerService(
        initialProvider,
        mockContractAddress,
        true,
      );
      const service2 = getAstriaWithdrawerService(
        newProvider,
        mockContractAddress,
        true,
      );

      expect(service1).toBe(service2);
    });

    it("should call withdrawToIbcChain for erc20 with correct parameters", async () => {
      const provider = new ethers.BrowserProvider({} as ethers.Eip1193Provider);

      const service = getAstriaWithdrawerService(
        provider,
        mockContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;

      await service.withdrawToIbcChain(
        mockFromAddress,
        mockDestinationAddress,
        mockAmount,
        mockAmountDenom,
        mockFee,
        mockMemo,
      );

      expect(mockContract.withdrawToIbcChain).toHaveBeenCalledWith(
        ethers.parseUnits(mockAmount, mockAmountDenom),
        mockDestinationAddress,
        mockMemo,
        { value: BigInt(mockFee) },
      );
    });
  });

  describe("getAstriaWithdrawerService", () => {
    it("should return AstriaWithdrawerService when isErc20 is false", () => {
      const service = getAstriaWithdrawerService(
        {} as ethers.BrowserProvider,
        mockContractAddress,
        false,
      );
      expect(service).toBeInstanceOf(AstriaWithdrawerService);
    });

    it("should return AstriaErc20WithdrawerService when isErc20 is true", () => {
      const service = getAstriaWithdrawerService(
        {} as ethers.BrowserProvider,
        mockContractAddress,
        true,
      );
      expect(service).toBeInstanceOf(AstriaErc20WithdrawerService);
    });
  });
});
