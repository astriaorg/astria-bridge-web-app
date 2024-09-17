import { formatBalance, formatChainAsNum } from "utils";

describe("Utility Functions", () => {
  describe("formatBalance", () => {
    it("should correctly format the balance", () => {
      expect(formatBalance("1000000000000000000")).toBe("1.00");
      expect(formatBalance("1500000000000000000")).toBe("1.50");
      expect(formatBalance("123456000000000000")).toBe("0.12");
    });
  });

  describe("formatChainAsNum", () => {
    it("should correctly convert hex chain ID to number", () => {
      expect(formatChainAsNum("0x1")).toBe(1);
      expect(formatChainAsNum("0xa")).toBe(10);
      expect(formatChainAsNum("0x2710")).toBe(10000);
    });
  });
});
