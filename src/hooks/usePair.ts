import type { IPair, IPairInfo } from "../contexts/environment";
import {
  reserve0Multicall,
  reserve1Multicall,
  totalSupplyMulticall,
} from "../utils/pairMulticall";
import { useBlockMulticall } from "./useBlockQuery";

export const usePair = (pair: IPair | null): IPairInfo | null => {
  const data = useBlockMulticall(
    pair
      ? [
          reserve0Multicall(pair),
          reserve1Multicall(pair),
          totalSupplyMulticall(pair),
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
