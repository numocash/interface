import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Call } from "@dahlia-labs/use-ethers";
import { tokenInterface } from "@dahlia-labs/use-ethers";
import { AddressZero } from "@ethersproject/constants";

import type { IPair, IPairInfo } from "../contexts/environment";
import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import { useBlockQuery } from "./useBlockQuery";

export const usePair = (pair: IPair | null): IPairInfo | null => {
  const calls: readonly Call[] = [
    {
      target: pair?.speculativeToken.address ?? AddressZero,
      callData: tokenInterface.encodeFunctionData("balanceOf", [
        pair?.address ?? AddressZero,
      ]),
    },
    {
      target: pair?.baseToken.address ?? AddressZero,
      callData: tokenInterface.encodeFunctionData("balanceOf", [
        pair?.address ?? AddressZero,
      ]),
    },
    {
      target: pair?.address ?? AddressZero,
      callData: tokenInterface.encodeFunctionData("totalSupply"),
    },
  ];

  const data = useBlockQuery("pair", calls, [pair?.address], !!pair);
  if (!data || !pair) return null;

  return {
    speculativeAmount: new TokenAmount(
      pair.speculativeToken,
      parseFunctionReturn(
        tokenInterface,
        "balanceOf",
        data.returnData[0]
      ).toString()
    ),
    baseAmount: new TokenAmount(
      pair.baseToken,
      parseFunctionReturn(
        tokenInterface,
        "balanceOf",
        data.returnData[1]
      ).toString()
    ),
    totalLPSupply: new TokenAmount(
      pair.lp,
      parseFunctionReturn(
        tokenInterface,
        "totalSupply",
        data.returnData[2]
      ).toString()
    ),
  };
};
