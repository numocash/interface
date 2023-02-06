import { getAddress } from "@ethersproject/address";
import type { Token } from "@uniswap/sdk-core";

import { useEnvironment } from "../contexts/environment2";
import type { HookArg } from "./useBalance";
import type { WrappedTokenInfo } from "./useTokens2";
import { dedupeTokens } from "./useTokens2";

export const useAddressToToken = (address: HookArg<string>) => {
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
  const token1s = useToken1s();
  return dedupeTokens(token0s.concat(token1s));
};

export const useSortDenomTokens = (
  tokens: readonly [WrappedTokenInfo, WrappedTokenInfo]
) => {
  const environment = useEnvironment();
  if (
    tokens[0].equals(environment.interface.stablecoin) ||
    tokens[1].equals(environment.interface.stablecoin)
  ) {
    return tokens[0].equals(environment.interface.stablecoin)
      ? tokens
      : ([tokens[1], tokens[0]] as const);
  }
  return tokens[0].equals(environment.interface.wrappedNative)
    ? tokens
    : ([tokens[1], tokens[0]] as const);
};
