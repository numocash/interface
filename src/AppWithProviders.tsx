// Import CELO chain information
import { Celo } from "@celo/rainbowkit-celo/chains";
// Import known recommended wallets
import { CeloDance, CeloWallet, Valora } from "@celo/rainbowkit-celo/wallets";
import { ThemeProvider } from "@emotion/react";
import {
  connectorsForWallets,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  omniWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import { App } from "./App";
import { BlockProvider } from "./contexts/block";
import { EnvironmentProvider } from "./contexts/environment";
import { EnvironmentProvider as EnvironmentProvider2 } from "./contexts/environment2";
import { SettingsProvider } from "./contexts/settings";
import { theme } from "./theme";

const { provider, chains } = configureChains(
  [Celo],
  [
    // alchemyProvider({
    //   apiKey: "UVgzpWCHx6zsVDO7qC8mtcA6jCl0vgV4",
    // }),
    jsonRpcProvider({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rpc: () => ({ http: Celo.rpcUrls.default.http[0]! }),
    }),
  ]
);

export { chains };

const { connectors } = getDefaultWallets({
  appName: "Numoen",
  chains,
});
const connectorsCELO = connectorsForWallets([
  {
    groupName: "Recommended with CELO",
    wallets: [
      Valora({ chains: [Celo] }),
      CeloWallet({ chains: [Celo] }),
      CeloDance({ chains: [Celo] }),
      omniWallet({ chains: [Celo] }),
      walletConnectWallet({ chains: [Celo] }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [...connectors(), ...connectorsCELO()],
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
                  <EnvironmentProvider2>
                    <SettingsProvider>
                      <App />
                    </SettingsProvider>
                  </EnvironmentProvider2>
                </EnvironmentProvider>
              </QueryClientProvider>
            </BlockProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ThemeProvider>
    </React.StrictMode>
  );
};
