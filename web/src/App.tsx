import type React from "react";
import { Route, Routes } from "react-router-dom";
import { ChainProvider } from "@cosmos-kit/react";
import { assets } from "chain-registry";
import { wallets } from "@cosmos-kit/keplr";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { evmChainsToRainbowKitChains, useConfig } from "config";
import { NotificationsContextProvider } from "features/Notifications";
import BridgePage from "pages/BridgePage/BridgePage";
import Layout from "pages/Layout";

// global styles
import "styles/index.scss";
// contrib styles
import "@rainbow-me/rainbowkit/styles.css";
import "@interchain-ui/react/styles";
import { toCosmosChainNames } from "./config/chainConfigs/types.ts";

/**
 * App component with routes.
 * Sets up the RainbowKitProvider and QueryClientProvider for tanstack/react-query.
 */
export default function App(): React.ReactElement {
  const { evmChains, ibcChains } = useConfig();

  const rainbowKitConfig = getDefaultConfig({
    appName: "Flame Bridge",
    projectId: "YOUR_PROJECT_ID", // TODO
    chains: evmChainsToRainbowKitChains(evmChains),
  });

  const queryClient = new QueryClient();

  const cosmosWalletConnectOptions = {
    signClient: {
      projectId: "YOUR_PROJECT_ID", // TODO
    },
  };

  return (
    <NotificationsContextProvider>
      <WagmiProvider config={rainbowKitConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ChainProvider
              chains={toCosmosChainNames(ibcChains)} // supported chains
              assetLists={assets} // supported asset lists
              wallets={wallets} // supported wallets
              walletConnectOptions={cosmosWalletConnectOptions} // required if `wallets` contains mobile wallets
            >
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<BridgePage />} />
                </Route>
              </Routes>
            </ChainProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </NotificationsContextProvider>
  );
}
