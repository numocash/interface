import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrum, celo, polygon } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { App } from "./App";
import { SettingsProvider } from "./contexts/settings";
import { EnvironmentProvider } from "./contexts/useEnvironment";
import { DefaultToasterWrapper } from "./utils/beet";

const { chains, provider, webSocketProvider } = configureChains(
  [
    arbitrum,
    polygon,
    {
      ...celo,
      blockExplorers: {
        ...celo.blockExplorers,
        default: celo.blockExplorers.etherscan,
      },
    },
  ],
  [
    alchemyProvider({ apiKey: "UVgzpWCHx6zsVDO7qC8mtcA6jCl0vgV4" }),
    alchemyProvider({ apiKey: "UOYl0nPuXw_tVCxLnPnd6lSYtj4agcDO" }),
    publicProvider(),
  ]
); // TODO: use websockets provider

export { chains };

export const toaster = new DefaultToasterWrapper();

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

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: 3, retryDelay: (attempt) => attempt * 250 },
  },
});

export const AppWithProviders: React.FC = () => {
  return (
    <React.StrictMode>
      <WagmiConfig client={wagmiClient}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />

          <RainbowKitProvider coolMode chains={chains}>
            <EnvironmentProvider>
              <SettingsProvider>
                <App />
              </SettingsProvider>
            </EnvironmentProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </React.StrictMode>
  );
};
