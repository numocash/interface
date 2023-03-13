import type { NativeCurrency } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

import type { chains } from "../AppWithProviders";
import type { Market } from "../hooks/useMarket";
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
  uniswapV2: {
    subgraph: string;
    factoryAddress: string;
    pairInitCodeHash: string;
    routerAddress: string;
  };
  uniswapV3: {
    subgraph: string;
    factoryAddress: string;
    pairInitCodeHash: string;
    quoterAddress: string;
  };
  numoenSubgraph: string;
  wrappedNative: WrappedTokenInfo;
  native?: NativeCurrency;
  specialtyMarkets?: readonly Market[];
  blockFreq: number; // How many blocks should go by before updating
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
