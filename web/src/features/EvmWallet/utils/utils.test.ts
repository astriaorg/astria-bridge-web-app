import { formatBalance, shortenAddress } from "./utils";

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

  describe("shortenAddress", () => {
    const testAddress = "0xb794f5ea0ba39494ce839613fffba74279579268";

    test("shortens address with default lengths", () => {
      // default start=6 end=4 so this includes "0x" plus 4 more chars at start
      expect(shortenAddress(testAddress)).toBe("0xb794...9268");
    });

    test("shortens address with custom lengths", () => {
      // start=8 includes "0x" plus 6 more chars
      expect(shortenAddress(testAddress, 8, 6)).toBe("0xb794f5...579268");
    });

    test("handles empty address", () => {
      expect(shortenAddress("")).toBe("");
    });

    test("handles undefined address", () => {
      expect(shortenAddress(undefined as unknown as string)).toBe("");
    });

    test("handles address shorter than requested lengths", () => {
      const shortAddress = "0x1234";
      expect(shortenAddress(shortAddress, 6, 4)).toBe("0x1234");
    });

    test("handles different combinations of start and end lengths", () => {
      // start=2 shows just "0x"
      expect(shortenAddress(testAddress, 2, 4)).toBe("0x...9268");
      // start=10 shows "0x" plus 8 more chars
      expect(shortenAddress(testAddress, 10, 2)).toBe("0xb794f5ea...68");
      // start=0 shows no start chars
      expect(shortenAddress(testAddress, 0, 4)).toBe("...9268");
      // end=0 shows no end chars
      expect(shortenAddress(testAddress, 6, 0)).toBe("0xb794...");
    });
  });
});
