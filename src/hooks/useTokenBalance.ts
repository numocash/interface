import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { tokenInterface } from "@dahlia-labs/use-ethers";
import { AddressZero } from "@ethersproject/constants";

import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import type { Call } from "./useBlockQuery";
import { useBlockQuery } from "./useBlockQuery";

export const useTokenBalance = (
  token: Token | null,
  address: string | null
): TokenAmount | null => {
  const call: Call = {
    target: token?.address ?? AddressZero,
    callData: tokenInterface.encodeFunctionData("balanceOf", [
      address ?? AddressZero,
    ]),
  };

  const { data } = useBlockQuery(
    "balance",
    [call],
    [token?.address, address],
    !!address && !!token
  );
  if (!data || !token) return null;
  return new TokenAmount(
    token,
    parseFunctionReturn(
      tokenInterface,
      "balanceOf",
      data?.returnData[0]
    ).toString()
  );
};

export const useTokenBalances = (
  tokens: (Token | null)[],
  address?: string | null
): (TokenAmount | null)[] | null => {
  const calls: Call[] = tokens.map((t) => ({
    target: t?.address ?? AddressZero,
    callData: tokenInterface.encodeFunctionData("balanceOf", [
      address ?? AddressZero,
    ]),
  }));

  const { data } = useBlockQuery(
    "balance",
    calls,
    [address].concat(tokens.map((t) => t?.address)),
    !!address
  );
  if (!data) return null;
  return tokens.map((t, i) =>
    t
      ? new TokenAmount(
          t,
          parseFunctionReturn(
            tokenInterface,
            "balanceOf",
            data?.returnData[i]
          ).toString()
        )
      : null
  );
};
