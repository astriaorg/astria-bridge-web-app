import { FlameNetwork, getChainConfigs } from "./chainConfigs";

describe("Chain Configs", () => {
  describe("getChainConfigs", () => {
    it("should return config for each valid network", () => {
      const networks = [
        FlameNetwork.LOCAL,
        FlameNetwork.DUSK,
        FlameNetwork.DAWN,
        FlameNetwork.MAINNET,
      ];

      for (const network of networks) {
        const config = getChainConfigs(network);
        expect(config).toBeDefined();
        expect(config.cosmosChains).toBeDefined();
        expect(config.evmChains).toBeDefined();
      }
    });
  });
});
