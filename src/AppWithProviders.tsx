import { ThemeProvider } from "@emotion/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";

import { App } from "./App";
import { BlockProvider } from "./contexts/block";
import { EnvironmentProvider } from "./contexts/environment";
import { SettingsProvider } from "./contexts/settings";
import { theme } from "./theme";

const { provider, chains } = configureChains(
  [chain.goerli],
  [
    infuraProvider({
      apiKey: "6f9c9bc239054e9fb755198cc1e4973a",
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const queryClient = new QueryClient();

export const AppWithProviders: React.FC = () => {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider coolMode chains={chains} initialChain={42220}>
            <BlockProvider>
              <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen={false} />
                <EnvironmentProvider>
                  <SettingsProvider>
                    <App />
                  </SettingsProvider>
                </EnvironmentProvider>
              </QueryClientProvider>
            </BlockProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ThemeProvider>
    </React.StrictMode>
  );
};
