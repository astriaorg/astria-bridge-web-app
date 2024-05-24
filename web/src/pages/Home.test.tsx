import React from "react";
import { screen } from "@testing-library/react";

import Home from "./Home";
import { renderWithRouter } from "testHelpers";

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // preserve other exports
  useNavigate: () => mockNavigate,
}));

describe("App", () => {
  test("renders home page correctly", () => {
    renderWithRouter(<Home />);
    const homeElem = screen.getAllByText(/astria/i);
    expect(homeElem).toHaveLength(1);
  });
});
