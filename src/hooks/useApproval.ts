import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { allowanceMulticall } from "@dahlia-labs/use-ethers";
import { AddressZero, MaxUint256 } from "@ethersproject/constants";
import { useCallback, useMemo } from "react";
import invariant from "tiny-invariant";

import { useSettings } from "../contexts/settings";
import { useBlockMulticall } from "./useBlockQuery";
import { useTokenContractFromAddress } from "./useContract";
import { useIsWrappedNative } from "./useTokens";

export const useTokenAllowance = (
  token: Token | null | undefined,
  address: string | null | undefined,
  spender: string | null | undefined
): TokenAmount | null => {
  const data = useBlockMulticall(
    token && address && spender
      ? [allowanceMulticall(token, address, spender)]
      : null
  );
  if (!data) return null;

  return data[0];
};

// returns true if the token needs approval
export const useApproval = (
  tokenAmount: TokenAmount | null | undefined,
  address: string | null | undefined,
  spender: string | null | undefined
): boolean | null => {
  const allowance = useTokenAllowance(tokenAmount?.token, address, spender);
  const isWrapped = useIsWrappedNative(tokenAmount?.token ?? null);

  return useMemo(() => {
    if (isWrapped) return false;
    return !allowance || !tokenAmount
      ? null
      : tokenAmount.greaterThan(allowance);
  }, [allowance, isWrapped, tokenAmount]);
};

export const useTokenAllowances = (
  tokens: Token[] | null | undefined,
  address: string | null | undefined,
  spender: string | null | undefined
): Readonly<TokenAmount[]> | null => {
  const data = useBlockMulticall(
    tokens && address && spender
      ? tokens.map((t) => allowanceMulticall(t, address, spender))
      : []
  );
  if (!data) return null;

  return data;
};

export function useApprove(
  amount: TokenAmount | null | undefined,
  spender: string | null | undefined
) {
  const { infiniteApprove } = useSettings();
  const tokenContract = useTokenContractFromAddress(
    amount?.token.address ?? AddressZero,
    true
  );

  return useCallback(async () => {
    invariant(tokenContract, "contract");
    invariant(amount && amount.greaterThan(0), "amount");
    invariant(spender, "approve spender");
    return await tokenContract.approve(
      spender,
      infiniteApprove ? MaxUint256 : amount.raw.toString()
    );
  }, [amount, infiniteApprove, spender, tokenContract]);
}
