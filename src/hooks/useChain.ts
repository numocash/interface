import type { ChainsV1 } from "@dahlia-labs/numoen-utils";
import { chainID } from "@dahlia-labs/use-ethers";
import { useMemo } from "react";
import { useNetwork } from "wagmi";

export const useChain = (): ChainsV1 => {
  const network = useNetwork();

  return useMemo(() => {
    if (!network.chain) return "arbitrum";
    if (chainID.goerli === network.chain?.id) return "goerli";
    else return "arbitrum";
  }, [network.chain]);
};
