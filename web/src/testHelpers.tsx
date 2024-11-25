import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render } from "@testing-library/react";
import type React from "react";
import { EthWalletContextProvider } from "features/EthWallet";
import { ConfigContextProvider, type EvmChains } from "config";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { evmChainsToRainbowKitChains } from "./config/chainConfigs/types.ts";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
        <WagmiProvider config={rainbowKitConfig}>
          <QueryClientProvider client={queryClient}>
            <EthWalletContextProvider>
              <Routes>
                <Route index path={"*"} element={element} />
              </Routes>
            </EthWalletContextProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ConfigContextProvider>
    </MemoryRouter>,
  );
};
