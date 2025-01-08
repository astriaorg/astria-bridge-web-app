import type { Chain } from "@chain-registry/types";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { ChainProvider } from "@cosmos-kit/react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { assets, chains } from "chain-registry";
import type React from "react";
import { Route, Routes } from "react-router-dom";
import { WagmiProvider } from "wagmi";

import {
  cosmosChainInfosToCosmosKitAssetLists,
  cosmosChainInfosToCosmosKitChains,
  evmChainsToRainbowKitChains,
  useConfig,
} from "config";
import { NotificationsContextProvider } from "features/Notifications";
import { BridgePage, PoolPage, SwapPage } from "./pages";
import Layout from "pages/Layout";

import "./index.css";
// contrib styles
import "@rainbow-me/rainbowkit/styles.css";
import "@interchain-ui/react/styles";


// https://docs.reown.com/ - for walletconnect so we can use mobile wallets
const WALLET_CONNECT_PROJECT_ID = "b1a4f5a9bc91120e74a7df1dd785b336";

/**
 * App component with routes.
 * Sets up the RainbowKitProvider and QueryClientProvider for tanstack/react-query.
 */
export default function App(): React.ReactElement {
  const { evmChains, cosmosChains } = useConfig();

  // wagmi and rainbowkit config, for evm chains
  const rainbowKitConfig = getDefaultConfig({
    appName: "Flame Bridge",
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: evmChainsToRainbowKitChains(evmChains),
  });
  const queryClient = new QueryClient();

  // cosmoskit config, for cosmos chains
  const cosmosWalletConnectOptions = {
    signClient: {
      projectId: WALLET_CONNECT_PROJECT_ID,
    },
  };
  // TODO - should i handle this so that for prod we rely on chain-registry?
  //  could do it lazily, https://cosmology.zone/learn/frontend/how-get-token-and-asset-information-in-the-interchain
  const cosmosKitChains = cosmosChainInfosToCosmosKitChains(cosmosChains);
  const cosmosKitAssetLists =
    cosmosChainInfosToCosmosKitAssetLists(cosmosChains);

  return (
    <NotificationsContextProvider>
      <WagmiProvider config={rainbowKitConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ChainProvider
              assetLists={[...assets, ...cosmosKitAssetLists]}
              chains={[...chains, ...cosmosKitChains]}
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
                  <Route path="/swap" element={<SwapPage />} />
                  <Route path="/pool" element={<PoolPage />} />
                </Route>
              </Routes>
            </ChainProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </NotificationsContextProvider>
  );
}
