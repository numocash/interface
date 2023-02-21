import { getAddress } from "@ethersproject/address";
import { Price, Token } from "@uniswap/sdk-core";

import { WrappedTokenInfo } from "../hooks/useTokens2";
import { Stable, WrappedNative } from "./tokens";
import type { Lendgine } from "./types";

export const wethLendgine = {
  token0: Stable[1],
  token1: WrappedNative[1],
  lendgine: new Token(1, "0x58248259ce18195E31979B8E0a5316194C19850d", 18),
  bound: new Price(
    Stable[1],
    WrappedNative[1],
    "1000000000000000000",
    "3000000000000000000000"
  ),
  token0Exp: Stable[1].decimals,
  token1Exp: WrappedNative[1].decimals,

  address: "0x58248259ce18195E31979B8E0a5316194C19850d",
} as const satisfies Lendgine;

const Illuvium = new WrappedTokenInfo({
  chainId: 1,
  address: "0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E",
  decimals: 18,
  symbol: "ILV",
  name: "Illuvium",
});

export const illuviumLendgine = {
  token0: WrappedNative[1],
  token1: Illuvium,
  lendgine: new Token(1, "0xd383f7A12eeB342428787a51fcA2589F17CcDEe3", 18),
  bound: new Price(
    WrappedNative[1],
    Illuvium,
    "1000000000000000000",
    "150000000000000000"
  ),

  token0Exp: WrappedNative[1].decimals,
  token1Exp: Illuvium.decimals,

  address: "0xd383f7A12eeB342428787a51fcA2589F17CcDEe3",
} as const satisfies Lendgine;

export const inverseIlluviumLendgine = {
  token0: Illuvium,
  token1: WrappedNative[1],
  lendgine: new Token(1, "0xDe61C307f2c442d4Bf7820fe57D79A3C8efbdD4f", 18),
  bound: new Price(
    Illuvium,
    WrappedNative[1],
    "1000000000000000000",
    "60000000000000000000"
  ),

  token0Exp: Illuvium.decimals,
  token1Exp: WrappedNative[1].decimals,

  address: "0xDe61C307f2c442d4Bf7820fe57D79A3C8efbdD4f",
} as const satisfies Lendgine;

export const foundryConfig = {
  base: {
    factory: getAddress("0x5986047C9B1F09b7870dF430C2d0D972e6b79aF5"),
    liquidityManager: getAddress("0xB04686AAD663224BE427427F4c9626960cef6925"),
    lendgineRouter: getAddress("0x056540C0392D2218C0C8d5633A146F46aAB1Ad7d"),
  },
  interface: {
    uniswapV2subgraph:
      "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
    uniswapV3subgraph:
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    numoenSubgraph: "http://localhost:8000/subgraphs/name/kyscott/numoen",
    wrappedNative: WrappedNative[1],
    stablecoin: Stable[1],
    defaultActiveLists: [
      "https://tokens.uniswap.org", // TODO: this is not returning very fast
      // "https://celo-org.github.io/celo-token-list/celo.tokenlist.json",
    ],
    defaultInactiveLists: [],
  },
  lendgines: [wethLendgine, illuviumLendgine, inverseIlluviumLendgine] as const,
} as const;

// uniswapV2subgraph:
// "https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap",
// uniswapV3subgraph:
// "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
