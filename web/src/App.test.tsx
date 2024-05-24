import React from "react";
import { screen } from "@testing-library/react";

import App from "./App";
import { renderWithRouter } from "testHelpers";

describe("App", () => {
  test("renders home page correctly", () => {
    renderWithRouter(<App />);
    const homeElem = screen.getAllByText(/astria/i);
    expect(homeElem).toHaveLength(1);
  });
});
