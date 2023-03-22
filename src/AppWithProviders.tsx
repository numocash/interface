import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrum, celo, polygon } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import { App } from "./App";
import { SettingsProvider } from "./contexts/settings";
import { EnvironmentProvider } from "./contexts/useEnvironment";

const { chains, provider, webSocketProvider } = configureChains(
  [
    {
      ...arbitrum,
      rpcUrls: {
        ...arbitrum.rpcUrls,
        default: {
          http: [
            "https://arb-mainnet.g.alchemy.com/v2/UVgzpWCHx6zsVDO7qC8mtcA6jCl0vgV4",
          ],
        },
      },
    },
    {
      ...polygon,
      rpcUrls: {
        ...polygon.rpcUrls,
        default: {
          http: [
            "https://polygon-mainnet.g.alchemy.com/v2/UOYl0nPuXw_tVCxLnPnd6lSYtj4agcDO",
          ],
        },
      },
    },
    {
      ...celo,
      blockExplorers: {
        ...celo.blockExplorers,
        default: celo.blockExplorers.etherscan,
      },
      rpcUrls: {
        ...polygon.rpcUrls,
        default: {
          http: ["https://forno.celo.org"],
        },
      },
    },
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        http: chain.rpcUrls.default.http[0]!,
      }),
    }),
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
