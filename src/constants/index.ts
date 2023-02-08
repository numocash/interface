import type { Price, Token } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

import type { chains, foundry } from "../AppWithProviders";
import type { WrappedTokenInfo } from "../hooks/useTokens2";
import { foundryConfig } from "./foundry";

export type SupportedChainIDs = (typeof chains)[number]["id"];

// TODO: where to put factory address of uniswapv2 and v3
export type NumoenBaseConfig = {
  factory: Address;
  lendgineRouter: Address;
  liquidityManager: Address;
};

// TODO: CELO doesn't need to be used as a native token
export type NumoenInterfaceConfig = {
  uniswapV2subgraph: string;
  uniswapV3subgraph: string;
  wrappedNative: WrappedTokenInfo;
  stablecoin: WrappedTokenInfo;
  defaultActiveLists: readonly string[];
  defaultInactiveLists: readonly string[];
};

export type Lendgine = {
  token0: WrappedTokenInfo;
  token1: WrappedTokenInfo;
  lendgine: Token;
  bound: Price<WrappedTokenInfo, WrappedTokenInfo>;

  token0Exp: number;
  token1Exp: number;

  address: Address;
};

// TODO: make lendgines type conditional on whether testnet property is set on chain
export const config: {
  [chain in SupportedChainIDs]: {
    interface: NumoenInterfaceConfig;
    base: NumoenBaseConfig;
    lendgines: chain extends (typeof foundry)["id"]
      ? readonly Lendgine[]
      : never; // include a lendgine property for testnet chains
  };
} = {
  6969: foundryConfig,
};
