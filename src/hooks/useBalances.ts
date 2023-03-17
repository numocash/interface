import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { utils } from "ethers";
import { useMemo } from "react";
import type { Address } from "wagmi";
import { erc20ABI } from "wagmi";

import { useContractReads } from "./internal/useContractReads";
import type { HookArg } from "./internal/utils";

export const useBalances = <T extends Token>(
  tokens: HookArg<readonly T[]>,
  address: HookArg<Address>
) => {
  const contracts = useMemo(
    () =>
      address && tokens
        ? tokens.map(
            (t) =>
              ({
                address: utils.getAddress(t.address),
                abi: erc20ABI,
                functionName: "balanceOf",
                args: [address],
              } as const)
          )
        : undefined,
    [address, tokens]
  );

  return useContractReads({
    contracts,
    allowFailure: false,
    staleTime: Infinity,
    enabled: !!tokens && !!address,
    select: (data) =>
      tokens
        ? data.map((d, i) =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            CurrencyAmount.fromRawAmount(tokens[i]!, d.toString())
          )
        : undefined,
    watch: true,
  });
};
