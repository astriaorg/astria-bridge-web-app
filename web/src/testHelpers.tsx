import { render } from "@testing-library/react";
import { ConfigContextProvider } from "config";
import type React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export const renderWithRouter = (element: React.JSX.Element) => {
  render(
    <MemoryRouter>
      <ConfigContextProvider>
        <Routes>
          <Route index path={"*"} element={element} />
        </Routes>
      </ConfigContextProvider>
    </MemoryRouter>,
  );
};
