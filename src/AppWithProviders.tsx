// Import CELO chain information
// Import known recommended wallets
import { ThemeProvider } from "@emotion/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import React from "react";
import type { Chain } from "wagmi";
import { configureChains, createClient, WagmiConfig } from "wagmi";

import { App } from "./App";
import { EnvironmentProvider } from "./contexts/environment2";
import { SettingsProvider } from "./contexts/settings";
import { theme } from "./theme";

export const foundry = {
  id: 1,
  name: "Foundry",
  network: "foundry",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
} as const satisfies Chain;

// todo add new celo chain with quicknode provider and env var for key
const { chains, provider, webSocketProvider } = configureChains(
  [foundry],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        http: chain.rpcUrls.default.http[0]!,
      }),
    }),
  ]
);

export { chains };

const { connectors } = getDefaultWallets({
  appName: "Numoen",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const queryClient = new QueryClient();

export const AppWithProviders: React.FC = () => {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider coolMode chains={chains}>
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools initialIsOpen={false} />
              <EnvironmentProvider>
                <SettingsProvider>
                  <App />
                </SettingsProvider>
              </EnvironmentProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ThemeProvider>
    </React.StrictMode>
  );
};
