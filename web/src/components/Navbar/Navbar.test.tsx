import React from "react";
import { screen } from "@testing-library/react";

import Navbar from "./Navbar";
import { renderWithRouter } from "testHelpers";

describe("Navbar Component", () => {
  test("renders company logo", () => {
    renderWithRouter(<Navbar />);
    const logoElem = screen.getByAltText(/logo/i);
    expect(logoElem).toBeInTheDocument();
  });
});
