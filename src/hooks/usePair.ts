import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Call } from "@dahlia-labs/use-ethers";
import { AddressZero } from "@ethersproject/constants";

import type { IPair, IPairInfo } from "../contexts/environment";
import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import { useBlockQuery } from "./useBlockQuery";
import { pairInterface } from "./useContract";

export const usePair = (pair: IPair | null): IPairInfo | null => {
  const calls: readonly Call[] = [
    {
      target: pair?.address ?? AddressZero,
      callData: pairInterface.encodeFunctionData("reserve0", [
        pair?.address ?? AddressZero,
      ]),
    },
    {
      target: pair?.address ?? AddressZero,
      callData: pairInterface.encodeFunctionData("reserve1", [
        pair?.address ?? AddressZero,
      ]),
    },
    {
      target: pair?.address ?? AddressZero,
      callData: pairInterface.encodeFunctionData("totalSupply"),
    },
  ];

  const data = useBlockQuery("pair", calls, [pair?.address], !!pair);
  if (!data || !pair) return null;

  return {
    speculativeAmount: new TokenAmount(
      pair.speculativeToken,
      parseFunctionReturn(
        pairInterface,
        "reserve0",
        data.returnData[0]
      ).toString()
    ),
    baseAmount: new TokenAmount(
      pair.baseToken,
      parseFunctionReturn(
        pairInterface,
        "reserve1",
        data.returnData[1]
      ).toString()
    ),
    totalLPSupply: new TokenAmount(
      pair.lp,
      parseFunctionReturn(
        pairInterface,
        "totalSupply",
        data.returnData[2]
      ).toString()
    ),
  };
};
