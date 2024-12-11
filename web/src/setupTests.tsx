// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

import { TextDecoder, TextEncoder } from "node:util";

// silence console logs and warnings
jest.spyOn(console, "debug").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

// mocked useNavigate so we can use web api in tests which run in node
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// mock browser globals
Object.defineProperties(global, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});
global.setImmediate = jest.useRealTimers as unknown as typeof setImmediate;

// mock styles used by cosmos-kit
jest.mock("@interchain-ui/react/styles", () => ({}), { virtual: true });

// mock cosmos-kit stuff
jest.mock("@cosmos-kit/react", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: idc b/c it's for testing
  ChainProvider: jest.fn(({ children }: { children: any }) => children),
  useWalletModal: jest.fn(() => ({
    openWalletModal: jest.fn(),
    closeWalletModal: jest.fn(),
  })),
  WalletModal: jest.fn(() => <div>Mocked WalletModal Component</div>),
  useChain: jest.fn(() => ({
    openView: jest.fn(),
    address: "0xb0E31D878F49Ec0403A25944d6B1aE1bf05D17E1",
  })),
}));

// mock wagmi completely
jest.mock("wagmi", () => {
  return {
    WagmiProvider: jest.fn(({ children }) => children),
    createConfig: jest.fn(() => ({
      chains: [],
      client: {},
    })),
    createConnector: jest.fn(),
    http: jest.fn(),
    useAccount: jest.fn(() => ({
      address: "0xb0E31D878F49Ec0403A25944d6B1aE1bf05D17E1",
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
    })),
    useAccountEffect: jest.fn(),
    useConnect: jest.fn(() => ({
      connect: jest.fn(),
      connectAsync: jest.fn(() => Promise.resolve()),
      connectors: [],
    })),
    useDisconnect: jest.fn(() => ({
      disconnect: jest.fn(),
    })),
    useBalance: jest.fn(() => ({
      data: { formatted: "0", symbol: "ETH" },
    })),
    useNetwork: jest.fn(() => ({
      chain: null,
      chains: [],
    })),
    useConfig: jest.fn(() => ({
      chains: ["celestia"],
    })),
    usePublicClient: jest.fn(),
    useEnsName: jest.fn(() => ({
      data: {},
    })),
    useEnsAvatar: jest.fn(() => ({
      data: {},
    })),
    useSwitchChain: jest.fn(() => ({
      chains: [],
      switchChain: jest.fn(),
    })),
  };
});

// mock osmojs
jest.mock("osmojs", () => ({
  osmosis: {
    ClientFactory: {
      createRPCQueryClient: jest.fn(() => ({
        cosmos: {
          bank: {
            v1beta1: {
              balance: jest.fn(() => ({
                balance: { amount: "1000000", denom: "utia" },
              })),
            },
          },
        },
      })),
    },
  },
}));

// mock chain-registry
jest.mock("chain-registry", () => ({
  assets: [],
  chains: [],
}));

// mock all cosmos-kit related packages
jest.mock("@cosmos-kit/keplr", () => ({
  wallets: [
    {
      name: "keplr",
      prettyName: "Keplr",
      mode: "extension",
    },
  ],
}));

jest.mock("@cosmos-kit/leap", () => ({
  wallets: [
    {
      name: "leap",
      prettyName: "Leap",
      mode: "extension",
    },
  ],
}));
