import { getAddress } from "@ethersproject/address";
import { Price, Token } from "@uniswap/sdk-core";

import { WrappedTokenInfo } from "../hooks/useTokens2";
import type { Lendgine } from ".";
import { Stable, WrappedNative } from "./tokens";

export const wethLendgine = {
  token0: Stable[1],
  token1: WrappedNative[1],
  lendgine: new Token(1, "0x984EC0723D3EB2CA58bD17401eCc00f0468bFbFa", 18),
  bound: new Price(
    Stable[1],
    WrappedNative[1],
    "22045404859097",
    "13909675486950929136232"
  ),
  token0Exp: Stable[1].decimals,
  token1Exp: WrappedNative[1].decimals,

  address: "0x984EC0723D3EB2CA58bD17401eCc00f0468bFbFa",
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
  lendgine: new Token(1, "0x6E26283717a0c6A8b0986fCad083DC628f340656", 18),
  bound: new Price(
    WrappedNative[1],
    Illuvium,
    "18803309900546737348402",
    "450163348659183003126396"
  ),

  token0Exp: WrappedNative[1].decimals,
  token1Exp: Illuvium.decimals,

  address: "0x6E26283717a0c6A8b0986fCad083DC628f340656",
} as const satisfies Lendgine;

export const foundryConfig = {
  base: {
    factory: getAddress("0x09c1133669cb9b49704dc27ae0b523be74467f2a"),
    liquidityManager: getAddress("0x0d0932b07aca7ea902d2432e70e054de8b12a834"),
    lendgineRouter: getAddress("0xb9afd5588d683aabd56538b555d2e17c7559b0b8"),
  },
  interface: {
    uniswapV2subgraph:
      "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
    uniswapV3subgraph:
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    wrappedNative: WrappedNative[1],
    stablecoin: Stable[1],
    defaultActiveLists: [
      "https://tokens.uniswap.org", // TODO: this is not returning very fast
      // "https://celo-org.github.io/celo-token-list/celo.tokenlist.json",
    ],
    defaultInactiveLists: [],
  },
  lendgines: [wethLendgine, illuviumLendgine] as const,
} as const;

// uniswapV2subgraph:
// "https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap",
// uniswapV3subgraph:
// "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
