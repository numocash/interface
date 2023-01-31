import { getAddress } from "@ethersproject/address";
import { useCallback } from "react";

import { useEnvironment } from "../contexts/environment";
import type { HookArg } from "./useApproval";

export const useAddressToToken = (address: HookArg<string>): Token | null => {
  const tokens = useAllTokens();
  if (!address) return null;
  return (
    tokens.find((t) => getAddress(t.address) === getAddress(address)) ?? null
  );
};

export const useMarketTokens = (): readonly Token[] => {
  return useEnvironment().markets.map((m) => m.token);
};

export const useSpeculativeTokens = (): readonly Token[] => {
  return useEnvironment().markets.map((m) => m.pair.speculativeToken);
};

export const useBaseTokens = (): readonly Token[] => {
  return useEnvironment().markets.map((m) => m.pair.baseToken);
};

export const useAllTokens = (): readonly Token[] => {
  const marketTokens = useMarketTokens();
  const speculativeTokens = useSpeculativeTokens();
  return [...speculativeTokens, ...marketTokens] as const;
};

export const useDenomToken = (tokens: readonly [Token, Token]): Token => {
  return useGetDenomToken()(tokens);
};

export const useGetDenomToken = () => {
  return useCallback((tokens: readonly [Token, Token]) => {
    const USDC = tokens.find((t) => t.symbol === "USDC");
    const ETH = tokens.find((t) => t.symbol === "WETH" || t.symbol === "ETH");
    return USDC ?? ETH ?? tokens[0];
  }, []);
};

export const useSortDenomTokens = (
  tokens: readonly [Token, Token]
): { denom: Token; other: Token } => {
  return useGetSortDenomTokens()(tokens);
};

export const useGetSortDenomTokens = () => {
  const getDenomToken = useGetDenomToken();
  return useCallback(
    (tokens: readonly [Token, Token]): { denom: Token; other: Token } => {
      const denomToken = getDenomToken(tokens);
      const otherToken = denomToken === tokens[0] ? tokens[1] : tokens[0];
      return { denom: denomToken, other: otherToken };
    },
    [getDenomToken]
  );
};

// https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup/graphql?query=query+MyQuery+%7B%0A++pair%28id%3A+%220x905dfcd5649217c42684f23958568e533c711aa3%22%29+%7B%0A++++id%0A++++token1Price%0A++++reserve1%0A++%7D%0A%7D
