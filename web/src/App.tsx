import type React from "react";
import { Route, Routes } from "react-router-dom";
import { EthWalletContextProvider } from "features/EthWallet/contexts/EthWalletContext";
import BridgePage from "pages/BridgePage/BridgePage";
import Layout from "pages/Layout";
import { NotificationsProvider } from "providers/NotificationsProvider";

/**
 * App component with routes.
 */
export default function App(): React.ReactElement {
  return (
    <NotificationsProvider>
      <EthWalletContextProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<BridgePage />} />
          </Route>
        </Routes>
      </EthWalletContextProvider>
    </NotificationsProvider>
  );
}
