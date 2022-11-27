import type { Token } from "@dahlia-labs/token-utils";
import { getAddress } from "@ethersproject/address";

import { useEnvironment } from "../contexts/environment";

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
