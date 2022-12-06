import type { ChainsV1 } from "@dahlia-labs/numoen-utils";
import { useMemo } from "react";

export const useChain = (): ChainsV1 => {
  return useMemo(() => {
    // if (!network.chain) return "arbitrum";
    // if (chainID.goerli === network.chain?.id) return "goerli";
    // else
    return "arbitrum";
  }, []);
};
