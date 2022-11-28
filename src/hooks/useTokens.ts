import type { Token } from "@dahlia-labs/token-utils";
import { getAddress } from "@ethersproject/address";
import { useCallback } from "react";

import { NativeTokens } from "../constants";
import { useEnvironment } from "../contexts/environment";
import { useChain } from "./useChain";

export const useAddressToToken = (address: string | null): Token | null => {
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

export const useAllTokens = (): readonly Token[] => {
  const marketTokens = useMarketTokens();
  const speculativeTokens = useSpeculativeTokens();
  return [...speculativeTokens, ...marketTokens] as const;
};

export const useIsWrappedNative = (token: Token | null) => {
  const chain = useChain();
  const native = NativeTokens[chain][0];
  return token === native;
};

export const useGetIsWrappedNative = () => {
  const chain = useChain();
  return useCallback(
    (token: Token | null) => {
      const native = NativeTokens[chain][0];
      return token === native;
    },
    [chain]
  );
};

export const useNative = () => {
  const chain = useChain();
  return NativeTokens[chain][1];
};

export const useDisplayToken = (token: Token | null) => {
  const isNative = useIsWrappedNative(token);
  const native = useNative();
  return isNative ? native : token;
};
