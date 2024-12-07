// mock @interchain-ui/react's core functionality for cosmos-kit
jest.mock('@interchain-ui/react', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: idc b/c it's for testing
  ThemeProvider: ({ children }: { children: any }) => children,
  useTheme: () => ({
    themeMode: 'dark',
    setThemeMode: jest.fn()
  }),
}));

// mock styles used by cosmos-kit
jest.mock('@interchain-ui/react/styles', () => ({}), { virtual: true });

// mock window.matchMedia for cosmos-kit's theming code
Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: jest.fn(() => ({
    matches: false,
    media: "(prefers-color-scheme: light)",
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});

// TODO - mock WalletModal from cosmos-kit

// TODO - bring this mock back and remove providers in testHelpers.tsx
// And ensure wagmi mock is complete
// jest.mock('wagmi', () => {
//   return {
//     WagmiProvider: jest.fn(({ children }) => children),
//     createConfig: jest.fn(() => ({
//       chains: [],
//       client: {},
//     })),
//     createConnector: jest.fn(),
//     http: jest.fn(),
//     useAccount: jest.fn(() => ({
//       address: '0x0',
//       isConnected: false,
//       isConnecting: false,
//       isDisconnected: true,
//     })),
//     useConnect: jest.fn(() => ({
//       connect: jest.fn(),
//       connectors: [],
//     })),
//     useDisconnect: jest.fn(() => ({
//       disconnect: jest.fn(),
//     })),
//     useBalance: jest.fn(() => ({
//       data: { formatted: '0', symbol: 'ETH' },
//     })),
//     useNetwork: jest.fn(() => ({
//       chain: null,
//       chains: [],
//     })),
//     useConfig: jest.fn(() => ({
//       config: {
//         chains: [],
//       },
//     })),
//   };
// });


// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

import { TextDecoder, TextEncoder } from "node:util";

// mocked useNavigate so we can use web api in tests which run in node
const mockedUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

// silence console logs and warnings
jest.spyOn(console, "debug").mockImplementation(() => {});
// jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

Object.defineProperties(global, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});

global.setImmediate = jest.useRealTimers as unknown as typeof setImmediate;
