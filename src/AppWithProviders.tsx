import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrum, celo } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { App } from "./App";
import { EnvironmentProvider } from "./contexts/environment2";
import { SettingsProvider } from "./contexts/settings";

const { chains, provider, webSocketProvider } = configureChains(
  [
    arbitrum,
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
    publicProvider(),
  ]
); // TODO: use websockets provider

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
      <WagmiConfig client={wagmiClient}>
        <QueryClientProvider client={queryClient}>
          {/* <ReactQueryDevtools /> */}

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
