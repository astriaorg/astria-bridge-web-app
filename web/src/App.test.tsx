import type React from "react";
import { screen } from "@testing-library/react";

import App from "./App";
import { renderWithRouter } from "testHelpers";

describe("App", () => {
  test("renders App correctly", () => {
    renderWithRouter(<App />);
  });
});
