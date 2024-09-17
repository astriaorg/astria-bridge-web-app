import { ethers } from "ethers";
import { getAstriaWithdrawerService } from "./AstriaWithdrawerService";

jest.mock("ethers");

describe("AstriaWithdrawerService", () => {
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

    // mock ethers.BrowserProvider
    mockProvider = {
      getSigner: jest.fn(),
    } as unknown as jest.Mocked<ethers.BrowserProvider>;

    // mock ethers.JsonRpcSigner
    mockSigner = {} as jest.Mocked<ethers.JsonRpcSigner>;

    // mock ethers.Contract
    mockContract = {
      withdrawToSequencer: jest.fn(),
      withdrawToIbcChain: jest.fn(),
    } as unknown as jest.Mocked<ethers.Contract>;

    // setup mocks
    (ethers.BrowserProvider as jest.Mock).mockReturnValue(mockProvider);
    mockProvider.getSigner.mockResolvedValue(mockSigner);
    (ethers.Contract as unknown as jest.Mock).mockReturnValue(mockContract);
    (ethers.parseEther as jest.Mock).mockReturnValue(mockAmount);
  });

  it("should throw an error if provider is not supplied on first instantiation", () => {
    expect(() => getAstriaWithdrawerService()).toThrow(
      "Provider must be supplied when creating the service instance",
    );
  });

  it("should throw an error if contract address is not supplied on first instantiation", () => {
    expect(() =>
      getAstriaWithdrawerService({} as ethers.Eip1193Provider),
    ).toThrow(
      "Contract address must be supplied when creating the service instance",
    );
  });

  it("should create a singleton instance", () => {
    const service1 = getAstriaWithdrawerService(
      {} as ethers.Eip1193Provider,
      mockContractAddress,
    );
    const service2 = getAstriaWithdrawerService();

    expect(service1).toBe(service2);
  });

  it("should update provider when a new one is supplied", () => {
    const service = getAstriaWithdrawerService({} as ethers.Eip1193Provider);
    const newProvider = {} as ethers.Eip1193Provider;
    const updatedService = getAstriaWithdrawerService(newProvider);

    expect(service).toBe(updatedService);
    expect(ethers.BrowserProvider).toHaveBeenCalledTimes(2);
  });
});
