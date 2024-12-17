import { render, screen } from "@testing-library/react";
import type React from "react";

import { ConfigContextProvider } from "config/contexts/ConfigContext";
import { useConfig } from "config/hooks/useConfig";

const TestComponent: React.FC = () => {
  const config = useConfig();
  return <div>{JSON.stringify(config)}</div>;
};

describe("ConfigContextProvider", () => {
  it("provides the correct config values", () => {
    render(
      <ConfigContextProvider>
        <TestComponent />
      </ConfigContextProvider>,
    );

    // NOTE - astria1d7z matches value in .env.test
    const configString = screen.getByText(/astria1d7z/);
    expect(configString).toBeInTheDocument();
    expect(configString).toHaveTextContent("Celestia Mocha-4");
  });

  it("throws an error when useConfig is used outside of ConfigContextProvider", () => {
    // this blocks the console.error output so the test output is clean
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useConfig must be used within a ConfigContextProvider",
    );
    consoleErrorSpy.mockRestore();
  });
});
