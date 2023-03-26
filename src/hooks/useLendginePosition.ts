import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

import { liquidityManagerABI } from "../abis/liquidityManager";
import { useEnvironment } from "../contexts/useEnvironment";
import { fractionToPrice } from "../lib/price";
import type { Lendgine } from "../lib/types/lendgine";
import type { HookArg, ReadConfig } from "./internal/types";
import { useContractRead } from "./internal/useContractRead";

export const useLendginePosition = <L extends Lendgine>(
  lendgine: HookArg<L>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();

  const config =
    !!lendgine && !!address
      ? getLendginePositionRead(
          lendgine,
          address,
          environment.base.liquidityManager
        )
      : {
          address: undefined,
          args: undefined,
          functionName: undefined,
          abi: undefined,
        };

  return useContractRead({
    ...config,
    staleTime: Infinity,
    enabled: !!lendgine && !!address,
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

export const getLendginePositionRead = <L extends Lendgine>(
  lendgine: Pick<L, "address">,
  address: Address,
  liquidityManager: Address
) =>
  ({
    address: liquidityManager,
    args: [address, lendgine.address],
    abi: liquidityManagerABI,
    functionName: "positions",
  } as const satisfies ReadConfig<typeof liquidityManagerABI, "positions">);
