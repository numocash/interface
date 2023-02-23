import type { Address } from "wagmi";

import type { chains } from "../AppWithProviders";
import type { WrappedTokenInfo } from "../hooks/useTokens2";
import { arbitrumConfig } from "./arbitrum";

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
  numoenSubgraph: string;
  wrappedNative: WrappedTokenInfo;
  stablecoin: WrappedTokenInfo;
  defaultActiveLists: readonly string[];
  defaultInactiveLists: readonly string[];
};

// TODO: make lendgines type conditional on whether testnet property is set on chain
export const config: {
  [chain in SupportedChainIDs]: {
    interface: NumoenInterfaceConfig;
    base: NumoenBaseConfig;
  };
} = {
  42161: arbitrumConfig,
};
