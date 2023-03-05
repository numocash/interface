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

// const foundry = {
//   id: 1,
//   name: "Foundry",
//   network: "foundry",
//   nativeCurrency: {
//     decimals: 18,
//     name: "Ether",
//     symbol: "ETH",
//   },
//   rpcUrls: {
//     default: {
//       http: ["http://127.0.0.1:8545"],
//     },
//     public: {
//       http: ["http://127.0.0.1:8545"],
//     },
//   },
// } as const;

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
  logger: {
    warn: null,
  },
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
        <RainbowKitProvider coolMode chains={chains}>
          <QueryClientProvider client={queryClient}>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            <EnvironmentProvider>
              <SettingsProvider>
                <App />
              </SettingsProvider>
            </EnvironmentProvider>
          </QueryClientProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </React.StrictMode>
  );
};
