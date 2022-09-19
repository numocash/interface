import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { AddressZero } from "@ethersproject/constants";
import invariant from "tiny-invariant";

import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import type { Call } from "./useBlockQuery";
import { useBlockQuery } from "./useBlockQuery";
import { useTokenContractFromAddress } from "./useContract";

export const useTokenBalance = (
  token: Token,
  address: string | null | undefined
): TokenAmount | null => {
  const tokenContract = useTokenContractFromAddress(AddressZero, false);
  invariant(tokenContract);

  const call: Call = {
    target: token.address,
    callData: tokenContract.interface.encodeFunctionData("balanceOf", [
      address ?? AddressZero,
    ]),
  };

  const { data } = useBlockQuery("balance", [call], [token.address, address]);
  if (!data || !address) return null;
  return new TokenAmount(
    token,
    parseFunctionReturn(
      tokenContract.interface,
      "balanceOf",
      data?.returnData[0]
    ).toString()
  );
};
