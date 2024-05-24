import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render } from "@testing-library/react";
import type React from "react";

export const renderWithRouter = (element: React.JSX.Element) => {
  render(
    <MemoryRouter>
      <Routes>
        <Route index path={"*"} element={element} />
      </Routes>
    </MemoryRouter>,
  );
};
