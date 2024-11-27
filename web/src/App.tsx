import type React from "react";
import { Route, Routes } from "react-router-dom";
import BridgePage from "pages/BridgePage/BridgePage";
import Layout from "pages/Layout";
import { useConfig } from "config";
import { NotificationsContextProvider } from "features/Notifications";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { evmChainsToRainbowKitChains } from "./config/chainConfigs/types.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

/**
 * App component with routes.
 */
export default function App(): React.ReactElement {
  const { evmChains } = useConfig();

  const rainbowKitConfig = getDefaultConfig({
    appName: "Flame Bridge",
    projectId: "YOUR_PROJECT_ID", // TODO
    chains: evmChainsToRainbowKitChains(evmChains),
  });

  const queryClient = new QueryClient();

  return (
    <NotificationsContextProvider>
      <WagmiProvider config={rainbowKitConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<BridgePage />} />
              </Route>
            </Routes>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </NotificationsContextProvider>
  );
}
