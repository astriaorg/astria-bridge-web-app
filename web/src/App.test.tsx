import type React from "react";

import { renderWithRouter } from "testHelpers";
import App from "./App";

describe("App", () => {
  test("renders App correctly", () => {
    renderWithRouter(<App />);
  });
});
