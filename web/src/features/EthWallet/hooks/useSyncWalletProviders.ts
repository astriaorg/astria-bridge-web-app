import { useSyncExternalStore } from "react";

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent;
  }
}

// store the detected wallet providers in a list
let providers: EIP6963ProviderDetail[] = [];

// a custom store that listens for eip6963:announceProvider events and stores the detected wallet providers
const ethWalletProviderStore = {
  value: () => providers,
  subscribe: (callback: () => void) => {
    function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
      if (providers.map((p) => p.info.uuid).includes(event.detail.info.uuid))
        return;
      providers = [...providers, event.detail];
      callback();
    }

    // listen for eip6963:announceProvider and call onAnnouncement when the event is triggered.
    window.addEventListener("eip6963:announceProvider", onAnnouncement);

    // dispatch the event, which triggers the event listener in the MetaMask wallet.
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // return a function that removes the event listener.
    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnouncement);
  },
};

/**
 * A hook that listens for eip6963:announceProvider events and returns the detected wallet providers.
 */
export const useSyncWalletProviders = () =>
  useSyncExternalStore(
    ethWalletProviderStore.subscribe,
    ethWalletProviderStore.value,
    ethWalletProviderStore.value,
  );
