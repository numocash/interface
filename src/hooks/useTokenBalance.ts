import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { balanceOfMulticall } from "@dahlia-labs/use-ethers";

import { useBlockMulticall } from "./useBlockQuery";

export const useTokenBalance = (
  token: Token | null | undefined,
  address: string | null | undefined
): TokenAmount | null => {
  const data = useBlockMulticall(
    token && address ? [balanceOfMulticall(token, address)] : null
  );
  if (!data) return null;
  return data[0];
};

export const useTokenBalances = (
  tokens: Token[] | null | undefined,
  address?: string | null | undefined
): Readonly<TokenAmount[]> | null => {
  const data = useBlockMulticall(
    tokens && address ? tokens.map((t) => balanceOfMulticall(t, address)) : []
  );
  if (!data) return null;
  return data;
};
