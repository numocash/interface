import { chainID } from "@dahlia-labs/use-ethers";
import { useMemo } from "react";
import { useChainId } from "wagmi";

import type { SupportedChains } from "../constants";

export const useChain = (): SupportedChains => {
  const chainNumber = useChainId();
  return useMemo(() => {
    if (chainNumber === chainID.arbitrum) return "arbitrum";
    if (chainNumber === chainID.celo) return "celo";
    return "arbitrum";
  }, [chainNumber]);
};
