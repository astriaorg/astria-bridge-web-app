import { getEnvVariable } from "./env";

describe("config", () => {
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
      process.env.REACT_APP_ENV = "test";
      expect(getEnvVariable("REACT_APP_ENV")).toBe("test");
    });

    it("should throw an error if the environment variable is not set", () => {
      expect(() => getEnvVariable("REACT_APP_VERSION")).toThrow(
        "REACT_APP_VERSION not set",
      );
    });
  });
});
