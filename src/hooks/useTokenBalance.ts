import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { balanceOfMulticall } from "@dahlia-labs/use-ethers";
import { useMemo } from "react";
import { useAccount, useBalance } from "wagmi";

import { useBlockMulticall } from "./useBlockQuery";
import { useIsWrappedNative, useNative } from "./useTokens";

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
  address: string | null | undefined
): Readonly<TokenAmount[]> | null => {
  const data = useBlockMulticall(
    tokens && address ? tokens.map((t) => balanceOfMulticall(t, address)) : []
  );
  if (!data) return null;
  return data;
};

export const useNativeTokenBalance = (): TokenAmount | null => {
  const { address } = useAccount();
  const native = useNative();
  const balance = useBalance({ address: address ?? undefined, watch: true });
  if (!balance.data) return null;

  return new TokenAmount(native, balance.data.value.toString());
};

export const useWrappedTokenBalance = (
  token: Token | null
): TokenAmount | null => {
  const { address } = useAccount();
  const nativeBalance = useNativeTokenBalance();
  const balance = useTokenBalance(token, address);
  const isWrapped = useIsWrappedNative(token);
  return useMemo(
    () => (isWrapped ? nativeBalance : balance),
    [balance, isWrapped, nativeBalance]
  );
};
