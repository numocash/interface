import { getAddress } from "@ethersproject/address";

import { Stable, WrappedNative } from "./tokens";

export const foundryConfig = {
  base: {
    factory: getAddress("0x09c1133669cb9b49704dc27ae0b523be74467f2a"),
    liquidityManager: getAddress("0x0d0932b07aca7ea902d2432e70e054de8b12a834"),
    lendgineRouter: getAddress("0xb9afd5588d683aabd56538b555d2e17c7559b0b8"),
  },
  interface: {
    uniswapV2subgraph:
      "https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap",
    uniswapV3subgraph:
      "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
    wrappedNative: WrappedNative[1],
    stablecoin: Stable[1],
    defaultActiveLists: [
      "https://tokens.uniswap.org", // TODO: this is not returning very fast
      // "https://celo-org.github.io/celo-token-list/celo.tokenlist.json",
    ],
    defaultInactiveLists: [],
  },
} as const;
