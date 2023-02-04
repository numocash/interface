import { getAddress } from "@ethersproject/address";
import type { Token } from "@uniswap/sdk-core";

import { useEnvironment } from "../contexts/environment2";
import type { HookArg } from "./useApproval";
import type { WrappedTokenInfo } from "./useTokens2";
import { dedupeTokens } from "./useTokens2";

export const useAddressToToken = (address: HookArg<string>): Token | null => {
  const tokens = useAllTokens();
  if (!address) return null;
  return (
    tokens.find((t) => getAddress(t.address) === getAddress(address)) ?? null
  );
};

export const useMarketTokens = (): readonly Token[] => {
  return useEnvironment().lendgines.map((l) => l.lendgine);
};

export const useToken0s = (): readonly WrappedTokenInfo[] => {
  return useEnvironment().lendgines.map((l) => l.token0);
};

export const useToken1s = (): readonly WrappedTokenInfo[] => {
  return useEnvironment().lendgines.map((l) => l.token1);
};

export const useAllTokens = (): readonly WrappedTokenInfo[] => {
  const token0s = useToken0s();
  const token1s = useToken0s();
  return dedupeTokens(token0s.concat(token1s));
};

// https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup/graphql?query=query+MyQuery+%7B%0A++pair%28id%3A+%220x905dfcd5649217c42684f23958568e533c711aa3%22%29+%7B%0A++++id%0A++++token1Price%0A++++reserve1%0A++%7D%0A%7D
