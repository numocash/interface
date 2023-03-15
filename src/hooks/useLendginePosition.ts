import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

import type { Lendgine } from "../constants/types";
import { useEnvironment } from "../contexts/useEnvironment";
import { liquidityManagerABI } from "../generated";
import { fractionToPrice } from "../utils/Numoen/price";
import { useContractRead } from "./internal/useContractRead";
import type { HookArg } from "./internal/utils";

export const useLendginePosition = <L extends Lendgine>(
  lendgine: HookArg<L>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();

  return useContractRead({
    address: environment.base.liquidityManager,
    args: address && lendgine ? [address, lendgine.address] : undefined,
    staleTime: Infinity,
    enabled: !!lendgine && !!address,
    watch: true,
    abi: liquidityManagerABI,
    functionName: "positions",
    select: (data) => {
      if (!lendgine) return undefined;
      return {
        size: CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          data.size.toString()
        ),
        rewardPerPositionPaid: fractionToPrice(
          new Fraction(data.rewardPerPositionPaid.toString()),
          lendgine.lendgine,
          lendgine.token1
        ),
        tokensOwed: CurrencyAmount.fromRawAmount(
          lendgine.token1,
          data.tokensOwed.toString()
        ),
      };
    },
  });
};
