import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render } from "@testing-library/react";
import type React from "react";
import {
  ConfigContextProvider,
  type EvmChains,
  evmChainsToRainbowKitChains,
} from "config";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { assets } from "chain-registry";
import { wallets } from "@cosmos-kit/keplr";
import { ChainProvider } from "@cosmos-kit/react";

const evmChains: EvmChains = {
  Testchain: {
    chainId: 1337,
    chainName: "Testchain",
    currencies: [
      {
        coinDenom: "Testchain",
        coinMinimalDenom: "testchain",
        coinDecimals: 18,
        ibcWithdrawalFeeWei: "0",
      },
    ],
    rpcUrls: ["http://localhost:8545"],
    blockExplorerUrl: "https://testchain-explorer.com",
  },
};

const rainbowKitConfig = getDefaultConfig({
  appName: "Flame Bridge",
  projectId: "YOUR_PROJECT_ID", // TODO
  chains: evmChainsToRainbowKitChains(evmChains),
});

const queryClient = new QueryClient();

export const renderWithRouter = (element: React.JSX.Element) => {
  render(
    <MemoryRouter>
      <ConfigContextProvider>
        {/* TODO - mock WagmiProvider, RainbowKitProvider, ChainProvider b/c App is wrapped with them. */}
        <WagmiProvider config={rainbowKitConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <ChainProvider
                walletModal={(props) => <div>WalletModal</div>}
                chains={["celestia"]} // supported chains
                assetLists={assets} // supported asset lists
                wallets={wallets} // supported wallets
              >
                <Routes>
                  <Route index path={"*"} element={element} />
                </Routes>
              </ChainProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ConfigContextProvider>
    </MemoryRouter>,
  );
};
