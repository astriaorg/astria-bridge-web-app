import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render } from "@testing-library/react";
import type React from "react";
import { EthWalletContextProvider } from "./features/EthWallet/contexts/EthWalletContext";
import { ConfigContextProvider } from "./config/contexts/ConfigContext";

export const renderWithRouter = (element: React.JSX.Element) => {
  render(
    <MemoryRouter>
      <ConfigContextProvider>
        <EthWalletContextProvider>
          <Routes>
            <Route index path={"*"} element={element} />
          </Routes>
        </EthWalletContextProvider>
      </ConfigContextProvider>
    </MemoryRouter>,
  );
};
