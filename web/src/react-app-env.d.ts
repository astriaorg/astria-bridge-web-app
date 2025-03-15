/// <reference types="react-scripts" />
import type { Keplr } from "@keplr-wallet/types";

declare global {
  interface Window {
    // window.keplr should be provided by the Keplr extension
    keplr?: Keplr;
  }
}
