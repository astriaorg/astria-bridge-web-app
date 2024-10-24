import type React from "react";
import { Route, Routes } from "react-router-dom";
import BridgePage from "pages/BridgePage/BridgePage";
import Layout from "pages/Layout";
import { ConfigContextProvider } from "config";
import { EthWalletContextProvider } from "features/EthWallet";
import { NotificationsContextProvider } from "features/Notifications";

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
