import type React from "react";
import { Route, Routes } from "react-router-dom";
import { EthWalletContextProvider } from "features/EthWallet/contexts/EthWalletContext";
import BridgePage from "pages/BridgePage/BridgePage";
import Layout from "pages/Layout";
import { NotificationsContextProvider } from "features/Notifications/contexts/NotificationsContext";
import { ConfigContextProvider } from "config/contexts/ConfigContext";

/**
 * App component with routes.
 */
export default function App(): React.ReactElement {
  return (
    <ConfigContextProvider>
      <NotificationsContextProvider>
        <EthWalletContextProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<BridgePage />} />
            </Route>
          </Routes>
        </EthWalletContextProvider>
      </NotificationsContextProvider>
    </ConfigContextProvider>
  );
}
