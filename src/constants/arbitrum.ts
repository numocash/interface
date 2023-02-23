import { chainID } from "@dahlia-labs/use-ethers";
import { getAddress } from "@ethersproject/address";

import { Stable, WrappedNative } from "./tokens";

export const arbitrumConfig = {
  base: {
    factory: getAddress("0x5986047C9B1F09b7870dF430C2d0D972e6b79aF5"),
    lendgineRouter: getAddress("0x99206b0070187E5e362c3058414d036968332d25"),
    liquidityManager: getAddress("0xc8a7eA3A6BcaEFfF6B5Fb808F8E66d247bFE02B5"),
  },
  interface: {
    uniswapV2subgraph:
      "https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup",
    uniswapV3subgraph:
      "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev",
    numoenSubgraph:
      "https://api.thegraph.com/subgraphs/name/kyscott18/numoen-arbitrum-test",
    wrappedNative: WrappedNative[chainID.arbitrum],
    stablecoin: Stable[chainID.arbitrum],
    defaultActiveLists: [
      "https://tokens.uniswap.org",
      "https://bridge.arbitrum.io/token-list-42161.json",
    ],
    defaultInactiveLists: [],
  },
} as const;
