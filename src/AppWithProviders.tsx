import { ThemeProvider } from "@emotion/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { arbitrum } from "@wagmi/chains";
import { GraphQLClient } from "graphql-request";
import React from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";

import { App } from "./App";
import { BlockProvider } from "./contexts/block";
import { EnvironmentProvider } from "./contexts/environment";
import { SettingsProvider } from "./contexts/settings";
import { theme } from "./theme";

export const graphQLClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
);

const { provider, chains } = configureChains(
  [arbitrum],
  [
    alchemyProvider({
      apiKey: "UVgzpWCHx6zsVDO7qC8mtcA6jCl0vgV4",
    }),
    // infuraProvider({
    //   apiKey: "6f9c9bc239054e9fb755198cc1e4973a",
    // }),
  ]
);

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
