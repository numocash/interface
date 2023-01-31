import type { Token } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

import type { chains } from "../AppWithProviders";
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
  wrappedNative: Token;
  stablecoin: Token;
  defaultActiveLists: readonly string[];
  defaultInactiveLists: readonly string[];
};

export const config: {
  [chain in SupportedChainIDs]: {
    interface: NumoenInterfaceConfig;
    base: NumoenBaseConfig;
  };
} = {
  1: foundryConfig,
};
