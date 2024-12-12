import type React from "react";
import { Route, Routes } from "react-router-dom";
import { ChainProvider } from "@cosmos-kit/react";
import { assets, chains } from "chain-registry";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import type { Chain } from "@chain-registry/types";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import {
  evmChainsToRainbowKitChains,
  cosmosChainInfosToCosmosKitChains,
  cosmosChainInfosToCosmosKitAssetLists,
  useConfig,
} from "config";
import { NotificationsContextProvider } from "features/Notifications";
import BridgePage from "pages/BridgePage/BridgePage";
import Layout from "pages/Layout";

// global styles
import "styles/index.scss";
// contrib styles
import "@rainbow-me/rainbowkit/styles.css";
import "@interchain-ui/react/styles";

/**
 * App component with routes.
 * Sets up the RainbowKitProvider and QueryClientProvider for tanstack/react-query.
 */
export default function App(): React.ReactElement {
  const { evmChains, ibcChains } = useConfig();

  // wagmi and rainbowkit config
  const rainbowKitConfig = getDefaultConfig({
    appName: "Flame Bridge",
    projectId: "YOUR_PROJECT_ID", // TODO
    chains: evmChainsToRainbowKitChains(evmChains),
  });
  const queryClient = new QueryClient();

  // cosmoskit config
  const cosmosWalletConnectOptions = {
    signClient: {
      projectId: "YOUR_PROJECT_ID", // TODO
    },
  };
  // TODO - should i handle this so that for prod we rely on chain-registry?
  //  could do it lazily, https://cosmology.zone/learn/frontend/how-get-token-and-asset-information-in-the-interchain
  const cosmosChains = cosmosChainInfosToCosmosKitChains(ibcChains);
  const cosmosAssetLists = cosmosChainInfosToCosmosKitAssetLists(ibcChains);

  return (
    <NotificationsContextProvider>
      <WagmiProvider config={rainbowKitConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ChainProvider
              assetLists={[...assets, ...cosmosAssetLists]}
              chains={[...chains, ...cosmosChains]}
              wallets={[...keplrWallets, ...leapWallets]}
              walletConnectOptions={cosmosWalletConnectOptions} // required if `wallets` contains mobile wallets
              signerOptions={{
                preferredSignType: (chain: string | Chain) => {
                  // NOTE - to support cosmos on ledger, from the keplr team:
                  // > it seems like the webapp enforces SIGN_MODE_DIRECT
                  // > for all transaction signing, but unfortunately due
                  // > to a weird cosmos history where Ledger isn’t able
                  // > to sign SIGN_MODE_DIRECT but only legacy amino messages
                  return "amino";
                },
              }}
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
