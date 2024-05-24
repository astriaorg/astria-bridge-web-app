/// <reference types="react-scripts" />
import type { MetaMaskInpageProvider } from "@metamask/providers";
import { Keplr } from "@keplr-wallet/types";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
    keplr?: Keplr;
  }
}
