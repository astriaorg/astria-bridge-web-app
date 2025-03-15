import { formatBalance } from "./utils";

describe("Utility Functions", () => {
  describe("formatBalance", () => {
    it("should correctly format the balance", () => {
      expect(formatBalance("1000000000000000000")).toBe("1.00");
      expect(formatBalance("1500000000000000000")).toBe("1.50");
      expect(formatBalance("123456000000000000")).toBe("0.12");

      expect(formatBalance("100000000000", 6)).toBe("100000.00");
      expect(formatBalance("150000000000", 6)).toBe("150000.00");
      expect(formatBalance("123456000000", 6)).toBe("123456.00");

      // huge number
      expect(formatBalance("1000000000000000000000000000000000")).toBe(
        "1000000000000000.00",
      );
    });
  });
});
