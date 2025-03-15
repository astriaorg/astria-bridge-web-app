import { nowPlusMinutesInNano } from "./utils";

describe("nowPlusMinutesInNano", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => 1600000000000); // 2020-09-13T12:26:40.000Z
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("converts 5 minutes to expected nanoseconds from now", () => {
    const result = nowPlusMinutesInNano(5);

    // assert the result is a BigInt
    expect(typeof result).toBe("bigint");

    // convert result back to milliseconds and check the time difference
    const resultInMs = Number(result / BigInt(1_000_000));
    const expectedMs = Date.now() + 5 * 60 * 1000;
    expect(resultInMs).toBe(expectedMs);
  });

  test("maintains millisecond precision when converting to nanoseconds", () => {
    const result = nowPlusMinutesInNano(1);
    // check that the last 6 digits (nanosecond portion) are zeros
    expect(result % BigInt(1_000_000)).toBe(BigInt(0));
  });

  test("handles zero minutes", () => {
    const result = nowPlusMinutesInNano(0);
    const expectedMs = Date.now();
    expect(Number(result / BigInt(1_000_000))).toBe(expectedMs);
  });
});
