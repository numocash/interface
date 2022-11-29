import type { IPair, IPairInfo } from "@dahlia-labs/numoen-utils";
import {
  reserve0Multicall,
  reserve1Multicall,
} from "@dahlia-labs/numoen-utils";
import { totalSupplyMulticall } from "@dahlia-labs/use-ethers";

import type { HookArg } from "./useApproval";
import { useBlockMulticall } from "./useBlockQuery";

export const usePair = (pair: HookArg<IPair>): IPairInfo | null => {
  // TODO: what if we pass in the full callback to the fetch function
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
