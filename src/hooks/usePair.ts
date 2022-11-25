import type { IPair, IPairInfo } from "@dahlia-labs/numoen-utils";
import {
  reserve0Multicall,
  reserve1Multicall,
} from "@dahlia-labs/numoen-utils";
import { totalSupplyMulticall } from "@dahlia-labs/use-ethers";

import { useBlockMulticall } from "./useBlockQuery";

export const usePair = (pair: IPair | null): IPairInfo | null => {
  const data = useBlockMulticall(
    pair
      ? [
          reserve0Multicall(pair),
          reserve1Multicall(pair),
          totalSupplyMulticall(pair.lp),
        ]
      : null
  );

  if (!data) return null;

  return {
    baseAmount: data[0],
    speculativeAmount: data[1],
    totalLPSupply: data[2],
  };
};
