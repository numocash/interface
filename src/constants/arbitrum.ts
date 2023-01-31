import { chainID } from "@dahlia-labs/use-ethers";

import { Stable, WrappedNative } from "./tokens";

export const arbitrumConfig = {
  interface: {
    uniswapV2subgraph:
      "https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup",
    uniswapV3subgraph:
      "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev",
    wrappedNative: WrappedNative[chainID.arbitrum],
    stablecoin: Stable[chainID.arbitrum],
    defaultActiveLists: [
      "https://tokens.uniswap.org",
      "https://bridge.arbitrum.io/token-list-42161.json",
    ],
    defaultInactiveLists: [],
  },
} as const;
