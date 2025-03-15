import { padDecimal } from "./utils"; // adjust import path as needed

describe("padDecimal", () => {
  test("adds leading zero to strings starting with decimal point", () => {
    expect(padDecimal(".5")).toBe("0.5");
    expect(padDecimal(".123")).toBe("0.123");
    expect(padDecimal(".0")).toBe("0.0");
  });

  test("does not modify strings that do not start with decimal point", () => {
    expect(padDecimal("1.5")).toBe("1.5");
    expect(padDecimal("10.123")).toBe("10.123");
    expect(padDecimal("0.5")).toBe("0.5");
    expect(padDecimal("123")).toBe("123");
  });

  test("handles edge cases", () => {
    // Empty string
    expect(padDecimal("")).toBe("");

    // Just a decimal point
    expect(padDecimal(".")).toBe("0.");

    // Multiple decimal points
    expect(padDecimal(".1.2")).toBe("0.1.2");

    // Leading zeros
    expect(padDecimal("00.5")).toBe("00.5");

    // Negative numbers
    expect(padDecimal("-.5")).toBe("-.5");
    expect(padDecimal("-0.5")).toBe("-0.5");
  });

  test("preserves string format without modifying actual numbers", () => {
    // Scientific notation
    expect(padDecimal("1e-10")).toBe("1e-10");

    // Very long decimals
    expect(padDecimal(".12345678901234567890")).toBe("0.12345678901234567890");

    // Trailing zeros
    expect(padDecimal(".500")).toBe("0.500");
  });
});
