import { render, screen } from "@testing-library/react";
import type React from "react";

import { useConfig } from "config/hooks/useConfig";
import { renderWithRouter } from "testHelpers";

const TestComponent: React.FC = () => {
  const config = useConfig();
  return <div>{JSON.stringify(config)}</div>;
};

describe("ConfigContextProvider", () => {
  it("provides the correct config values", () => {
    renderWithRouter(<TestComponent />);

    const configString = screen.getByText(
      // this string in the mainnet configs, which are used by default
      /astria13vptdafyttpmlwppt0s844efey2cpc0mevy92p/,
    );
    expect(configString).toBeInTheDocument();
    expect(configString).toHaveTextContent("Celestia");
  });

  it("throws an error when useConfig is used outside of ConfigContextProvider", () => {
    expect(() => render(<TestComponent />)).toThrow(
      "useConfig must be used within a ConfigContextProvider",
    );
  });
});
