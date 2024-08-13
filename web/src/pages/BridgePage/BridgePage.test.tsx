import type React from "react";
import { screen } from "@testing-library/react";

import { renderWithRouter } from "testHelpers";
import BridgePage from "./BridgePage";

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // preserve other exports
  useNavigate: () => mockNavigate,
}));

describe("BridgePage", () => {
  test("renders bridge page correctly", () => {
    renderWithRouter(<BridgePage />);
    const bridgeCard = screen.getAllByText(/Deposit/i);
    expect(bridgeCard).toHaveLength(2);
  });
});
