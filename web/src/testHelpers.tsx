import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render } from "@testing-library/react";

export const renderWithRouter = (element: JSX.Element) => {
  render(
    <MemoryRouter>
      <Routes>
        <Route index path={"*"} element={element} />
      </Routes>
    </MemoryRouter>,
  );
};
