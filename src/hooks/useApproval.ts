import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Call } from "@dahlia-labs/use-ethers";
import { tokenInterface } from "@dahlia-labs/use-ethers";
import { AddressZero, MaxUint256 } from "@ethersproject/constants";
import { useCallback, useMemo } from "react";
import invariant from "tiny-invariant";

import { useSettings } from "../contexts/settings";
import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import { useBlockQuery } from "./useBlockQuery";
import { useTokenContractFromAddress } from "./useContract";

export const useTokenAllowance = (
  token: Token | null | undefined,
  address: string | null | undefined,
  spender: string | null | undefined
): TokenAmount | null => {
  const call: Call = {
    target: token?.address ?? AddressZero,
    callData: tokenInterface.encodeFunctionData("allowance", [
      address ?? AddressZero,
      spender ?? AddressZero,
    ]),
  };

  const data = useBlockQuery(
    "allowance",
    [call],
    [token?.address, address, spender],
    token && address && spender ? true : false
  );
  if (!data || !data.returnData || !address || !spender || !token) return null;

  const allowance = parseFunctionReturn(
    tokenInterface,
    "allowance",
    data?.returnData[0]
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new TokenAmount(token, allowance[0]);
};

// returns true if the token needs approval
export const useApproval = (
  tokenAmount: TokenAmount | null | undefined,
  address: string | null | undefined,
  spender: string | null | undefined
): boolean | null => {
  const allowance = useTokenAllowance(tokenAmount?.token, address, spender);

  return useMemo(
    () =>
      !allowance || !tokenAmount ? null : tokenAmount.greaterThan(allowance),
    [allowance, tokenAmount]
  );
};

export const useTokenAllowances = (
  tokens: (Token | null | undefined)[],
  address: string | null | undefined,
  spender: string | null | undefined
): (TokenAmount | null)[] | null => {
  const calls: Call[] = tokens.map((t) => ({
    target: t?.address ?? AddressZero,
    callData: tokenInterface.encodeFunctionData("allowance", [
      address ?? AddressZero,
      spender ?? AddressZero,
    ]),
  }));

  const data = useBlockQuery(
    "allowance",
    calls,
    [...tokens.map((t) => t?.address), address, spender],
    address && spender ? true : false
  );
  if (!data) return null;

  return tokens.map((t, i) =>
    t
      ? new TokenAmount(
          t,
          parseFunctionReturn(
            tokenInterface,
            "allowance",
            data?.returnData[i]
          ).toString()
        )
      : null
  );
};

export function useApprove(
  amount: TokenAmount | undefined | null,
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
