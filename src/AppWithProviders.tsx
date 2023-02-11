import { ThemeProvider } from "@emotion/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { foundry } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { App } from "./App";
import { EnvironmentProvider } from "./contexts/environment2";
import { SettingsProvider } from "./contexts/settings";
import { theme } from "./theme";

// todo add new celo chain with quicknode provider and env var for key
const { chains, provider } = configureChains([foundry], [publicProvider()]);

export { chains };

const { connectors } = getDefaultWallets({
  appName: "Numoen",
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
