import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import type { Address } from "wagmi";

import type { Lendgine } from "../constants/types";
import { useEnvironment } from "../contexts/useEnvironment";
import { liquidityManagerABI } from "../generated";
import { fractionToPrice } from "../utils/Numoen/price";
import { scale } from "../utils/Numoen/trade";
import { useContractReads } from "./internal/useContractReads";
import type { HookArg } from "./internal/utils";

export const useLendginesPositions = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();
  const contracts = useMemo(
    () =>
      !!lendgines && !!address
        ? lendgines.map(
            (l) =>
              ({
                address: environment.base.liquidityManager,
                abi: liquidityManagerABI,
                functionName: "positions",
                args: [address, l.address],
              } as const)
          )
        : undefined,
    [address, environment.base.liquidityManager, lendgines]
  );

  return useContractReads({
    contracts,
    staleTime: Infinity,
    allowFailure: false,
    enabled: !!contracts,
    watch: true,
    select: (data) => {
      if (!lendgines) return undefined;
      return data.map((p, i) => {
        const lendgine = lendgines[i];
        invariant(lendgine);
        return {
          size: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            p.size.toString()
          ),
          rewardPerPositionPaid: fractionToPrice(
            new Fraction(p.rewardPerPositionPaid.toString(), scale),
            lendgine.lendgine,
            lendgine.token1
          ),
          tokensOwed: CurrencyAmount.fromRawAmount(
            lendgine.token1,
            p.tokensOwed.toString()
          ),
        };
      });
    },
  });
};
