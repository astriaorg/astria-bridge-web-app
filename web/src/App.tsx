import type React from "react";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { CelestiaChainInfo } from "chainInfos";
import BridgePage from "pages/BridgePage/BridgePage";
import Layout from "pages/Layout";
import { NotificationsProvider } from "providers/NotificationsProvider";
import { getKeplrFromWindow } from "services/keplr";

/**
 * App component with routes.
 */
export default function App(): React.ReactElement {
  useEffect(() => {
    void suggestCelestia();
  }, []);

  const suggestCelestia = async () => {
    const keplr = await getKeplrFromWindow();
    if (!keplr) {
      return;
    }

    try {
      await keplr.experimentalSuggestChain(CelestiaChainInfo);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
  };

  return (
    <NotificationsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<BridgePage />} />
        </Route>
      </Routes>
    </NotificationsProvider>
  );
}
