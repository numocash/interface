import type { Address } from "wagmi";

import type { chains } from "../AppWithProviders";
import type { WrappedTokenInfo } from "../hooks/useTokens2";
import { arbitrumConfig } from "./arbitrum";
import { celoConfig } from "./celo";

export type SupportedChainIDs = (typeof chains)[number]["id"];

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
};

export const config: {
  [chain in SupportedChainIDs]: {
    interface: NumoenInterfaceConfig;
    base: NumoenBaseConfig;
  };
} = {
  42161: arbitrumConfig,
  42220: celoConfig,
};
