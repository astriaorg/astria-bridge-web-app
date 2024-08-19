import {
  getEnvVariable,
  formatBalance,
  formatChainAsNum,
  formatAddress,
  capitalize,
} from "utils"; // Adjust the import path as needed

describe("Utility Functions", () => {
  describe("getEnvVariable", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it("should return the value of an existing environment variable", () => {
      process.env.TEST_VAR = "test_value";
      expect(getEnvVariable("TEST_VAR")).toBe("test_value");
    });

    it("should throw an error if the environment variable is not set", () => {
      expect(() => getEnvVariable("NON_EXISTENT_VAR")).toThrow(
        "NON_EXISTENT_VAR not set",
      );
    });
  });

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

  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("World");
      expect(capitalize("tEsT")).toBe("Test");
    });

    it("should handle empty strings", () => {
      expect(capitalize("")).toBe("");
    });

    it("should handle single-character strings", () => {
      expect(capitalize("a")).toBe("A");
    });
  });
});
