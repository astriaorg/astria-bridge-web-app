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
      withdrawToSequencer: jest.fn(),
      withdrawToIbcChain: jest.fn(),
    } as unknown as jest.Mocked<ethers.Contract>;

    (ethers.BrowserProvider as jest.Mock).mockReturnValue(mockProvider);
    mockProvider.getSigner.mockResolvedValue(mockSigner);
    (ethers.Contract as jest.Mock).mockReturnValue(mockContract);
    (ethers.parseEther as jest.Mock).mockReturnValue(
      ethers.parseUnits(mockAmount, 18),
    );
  });

  describe("AstriaWithdrawerService", () => {
    it("should create a singleton instance", () => {
      const service1 = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
      );
      const service2 = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
      );

      expect(service1).toBe(service2);
      expect(service1).toBeInstanceOf(AstriaWithdrawerService);
    });

    it("should update provider when a new one is supplied", () => {
      const initialProvider = {} as ethers.Eip1193Provider;
      const newProvider = {} as ethers.Eip1193Provider;

      const service1 = getAstriaWithdrawerService(
        initialProvider,
        mockContractAddress,
      );
      const service2 = getAstriaWithdrawerService(
        newProvider,
        mockContractAddress,
      );

      expect(service1).toBe(service2);
      expect(ethers.BrowserProvider).toHaveBeenCalledTimes(2);
      expect(ethers.BrowserProvider).toHaveBeenNthCalledWith(
        1,
        initialProvider,
      );
      expect(ethers.BrowserProvider).toHaveBeenNthCalledWith(2, newProvider);
    });

    it("should call withdrawToSequencer with correct parameters", async () => {
      const service = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
      ) as AstriaWithdrawerService;

      await service.withdrawToSequencer(
        mockFromAddress,
        mockDestinationAddress,
        mockAmount,
      );

      expect(mockContract.withdrawToSequencer).toHaveBeenCalledWith(
        mockDestinationAddress,
        { value: ethers.parseUnits(mockAmount, 18) },
      );
    });

    it("should call withdrawToIbcChain with correct parameters", async () => {
      const service = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
      ) as AstriaWithdrawerService;

      await service.withdrawToIbcChain(
        mockFromAddress,
        mockDestinationAddress,
        mockAmount,
        mockMemo,
      );

      expect(mockContract.withdrawToIbcChain).toHaveBeenCalledWith(
        mockDestinationAddress,
        mockMemo,
        { value: ethers.parseUnits(mockAmount, 18) },
      );
    });
  });

  describe("AstriaErc20WithdrawerService", () => {
    it("should create a singleton instance", () => {
      const service1 = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
        true,
      );
      const service2 = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
        true,
      );

      expect(service1).toBe(service2);
      expect(service1).toBeInstanceOf(AstriaErc20WithdrawerService);
    });

    it("should update provider when a new one is supplied", () => {
      const initialProvider = {} as ethers.Eip1193Provider;
      const newProvider = {} as ethers.Eip1193Provider;

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
      expect(ethers.BrowserProvider).toHaveBeenCalledTimes(2);
      expect(ethers.BrowserProvider).toHaveBeenNthCalledWith(
        1,
        initialProvider,
      );
      expect(ethers.BrowserProvider).toHaveBeenNthCalledWith(2, newProvider);
    });

    it("should call withdrawToSequencer with correct parameters", async () => {
      const service = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;

      await service.withdrawToSequencer(
        mockFromAddress,
        mockDestinationAddress,
        mockAmount,
      );

      expect(mockContract.withdrawToSequencer).toHaveBeenCalledWith(
        ethers.parseUnits(mockAmount, 18),
        mockDestinationAddress,
        { value: ethers.parseUnits(mockAmount, 18) },
      );
    });

    it("should call withdrawToIbcChain with correct parameters", async () => {
      const service = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;

      await service.withdrawToIbcChain(
        mockFromAddress,
        mockDestinationAddress,
        mockAmount,
        mockMemo,
      );

      expect(mockContract.withdrawToIbcChain).toHaveBeenCalledWith(
        ethers.parseUnits(mockAmount, 18),
        mockDestinationAddress,
        mockMemo,
        { value: ethers.parseUnits(mockAmount, 18) },
      );
    });
  });

  describe("getAstriaWithdrawerService", () => {
    it("should return AstriaWithdrawerService when isErc20 is false", () => {
      const service = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
        false,
      );
      expect(service).toBeInstanceOf(AstriaWithdrawerService);
    });

    it("should return AstriaErc20WithdrawerService when isErc20 is true", () => {
      const service = getAstriaWithdrawerService(
        {} as ethers.Eip1193Provider,
        mockContractAddress,
        true,
      );
      expect(service).toBeInstanceOf(AstriaErc20WithdrawerService);
    });
  });
});
