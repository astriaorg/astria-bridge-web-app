import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render } from "@testing-library/react";
import type React from "react";
import { EthWalletContextProvider } from "./features/EthWallet/contexts/EthWalletContext";

export const renderWithRouter = (element: React.JSX.Element) => {
  render(
    <MemoryRouter>
      <EthWalletContextProvider>
        <Routes>
          <Route index path={"*"} element={element} />
        </Routes>
      </EthWalletContextProvider>
    </MemoryRouter>,
  );
};
