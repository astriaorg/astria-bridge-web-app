import { render } from "@testing-library/react";
import { ConfigContextProvider } from "config";
import type React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { EvmWalletProvider } from "./features/EvmWallet";

export const renderWithRouter = (element: React.JSX.Element) => {
  render(
    <MemoryRouter>
      <ConfigContextProvider>
        <EvmWalletProvider>
          <Routes>
            <Route index path={"*"} element={element} />
          </Routes>
        </EvmWalletProvider>
      </ConfigContextProvider>
    </MemoryRouter>,
  );
};
