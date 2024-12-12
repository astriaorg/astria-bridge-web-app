import { getEnvChainConfigs } from "./chainConfigs";
import type { CosmosChains, EvmChains } from "./chainConfigs/types";

// mock the config import to control getEnvVariable
jest.mock("config", () => ({
  getEnvVariable: jest.fn(),
}));

// import the mocked function for type safety
import { getEnvVariable } from "config";

describe("Chain Configs", () => {
  // Store original env vars
  const originalEnv = process.env;

  beforeEach(() => {
    // clear all mocks before each test
    jest.clearAllMocks();
    // reset env vars
    process.env = { ...originalEnv };
    // reset the mock implementation
    (getEnvVariable as jest.Mock).mockImplementation((key: string) => {
      if (process.env[key]) return process.env[key];
      throw new Error(`${key} not set`);
    });
  });

  afterAll(() => {
    // restore original env vars
    process.env = originalEnv;
  });

  describe("getEnvChainConfigs", () => {
    const mockIbcChains: CosmosChains = {
      "Test Chain": {
        chainId: "test-1",
        chainName: "Test Chain",
        currencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "utest",
            coinDecimals: 6,
          },
        ],
        bech32Config: {
          bech32PrefixAccAddr: "test",
          bech32PrefixAccPub: "testpub",
          bech32PrefixConsAddr: "testvalcons",
          bech32PrefixConsPub: "testvalconspub",
          bech32PrefixValAddr: "testvaloper",
          bech32PrefixValPub: "testvaloperpub",
        },
        bip44: { coinType: 118 },
        stakeCurrency: {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
        feeCurrencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "utest",
            coinDecimals: 6,
          },
        ],
        rest: "https://api.test.com",
        rpc: "https://rpc.test.com",
      },
    };

    const mockEvmChains: EvmChains = {
      "Test EVM Chain": {
        chainId: 1234,
        chainName: "Test EVM Chain",
        rpcUrls: ["https://rpc.test.com"],
        currencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "utest",
            coinDecimals: 18,
            ibcWithdrawalFeeWei: "10000000000000000",
          },
        ],
      },
    };

    it("should error when expected environment variables are not set", () => {
      process.env.REACT_APP_ENV = "";
      expect(() => getEnvChainConfigs()).toThrowError("REACT_APP_ENV not set");
    });

    it("should return environment-specific config for each valid environment", () => {
      const environments = ["local", "dusk", "dawn", "mainnet"];

      for (const env of environments) {
        (getEnvVariable as jest.Mock).mockImplementation((key: string) => {
          if (key === "REACT_APP_ENV") return env;
          throw new Error(`${key} not set`);
        });

        const config = getEnvChainConfigs();
        expect(config).toBeDefined();
        expect(config.ibc).toBeDefined();
        expect(config.evm).toBeDefined();
      }
    });

    it("should override IBC chains when REACT_APP_IBC_CHAINS is set", () => {
      // set up environment
      (getEnvVariable as jest.Mock).mockImplementation((key: string) => {
        if (key === "REACT_APP_ENV") return "local";
        if (key === "REACT_APP_IBC_CHAINS")
          return JSON.stringify(mockIbcChains);
        throw new Error(`${key} not set`);
      });

      const config = getEnvChainConfigs();
      expect(config.ibc).toEqual(mockIbcChains);
      // EVM chains should still be from local config
      expect(config.evm.Flame.chainName).toEqual("Flame (local)");
    });

    it("should override EVM chains when REACT_APP_EVM_CHAINS is set", () => {
      // set up environment
      (getEnvVariable as jest.Mock).mockImplementation((key: string) => {
        if (key === "REACT_APP_ENV") return "local";
        if (key === "REACT_APP_EVM_CHAINS")
          return JSON.stringify(mockEvmChains);
        throw new Error(`${key} not set`);
      });

      const config = getEnvChainConfigs();
      expect(config.evm).toEqual(mockEvmChains);
      // IBC chains should still be from local config
      expect(config.ibc["Celestia Local"].chainName).toEqual("Celestia Local");
    });

    it("should override both chains when both environment variables are set", () => {
      // set up environment
      (getEnvVariable as jest.Mock).mockImplementation((key: string) => {
        if (key === "REACT_APP_ENV") return "local";
        if (key === "REACT_APP_IBC_CHAINS")
          return JSON.stringify(mockIbcChains);
        if (key === "REACT_APP_EVM_CHAINS")
          return JSON.stringify(mockEvmChains);
        throw new Error(`${key} not set`);
      });

      const config = getEnvChainConfigs();
      expect(config.ibc).toEqual(mockIbcChains);
      expect(config.evm).toEqual(mockEvmChains);
    });

    it("should handle invalid JSON in IBC and EVM chains override", () => {
      // set up environment
      (getEnvVariable as jest.Mock).mockImplementation((key: string) => {
        if (key === "REACT_APP_ENV") return "local";
        if (key === "REACT_APP_IBC_CHAINS") return "invalid json";
        if (key === "REACT_APP_EVM_CHAINS") return "invalid json";
        throw new Error(`${key} not set`);
      });

      const config = getEnvChainConfigs();
      // should fall back to local config
      expect(config.ibc["Celestia Local"].chainName).toEqual("Celestia Local");
      expect(config.evm.Flame.chainName).toEqual("Flame (local)");
    });

    it("should handle mixed valid and invalid JSON overrides", () => {
      // set up environment
      (getEnvVariable as jest.Mock).mockImplementation((key: string) => {
        if (key === "REACT_APP_ENV") return "local";
        if (key === "REACT_APP_IBC_CHAINS")
          return JSON.stringify(mockIbcChains);
        if (key === "REACT_APP_EVM_CHAINS") return "invalid json";
        throw new Error(`${key} not set`);
      });

      const config = getEnvChainConfigs();
      expect(config.ibc).toEqual(mockIbcChains); // should use override
      expect(config.evm.Flame.chainName).toEqual("Flame (local)"); // should fall back to local config
    });
  });
});
