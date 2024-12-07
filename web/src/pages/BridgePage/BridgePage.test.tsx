import type React from "react";
import { screen } from "@testing-library/react";

import { renderWithRouter } from "testHelpers";
import BridgePage from "./BridgePage";

describe("BridgePage", () => {
  test("renders bridge page correctly", () => {
    renderWithRouter(<BridgePage />);
    const bridgeCard = screen.getAllByText(/deposit/i);
    expect(bridgeCard).toHaveLength(2);
  });
});
