import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import type { FetchBalanceArgs, FetchBalanceResult } from "wagmi/actions";
import { fetchBalance } from "wagmi/actions";

import { useChain } from "../useChain";
import type { QueryFunctionArgs } from "./types";
import { useInvalidateOnBlock } from "./useInvalidateOnBlock";

export type UseBalanceArgs = Partial<FetchBalanceArgs> & {
  /** Subscribe to changes */
  watch?: boolean;
};

export type UseBalanceConfig<TSelectData = FetchBalanceResult> =
  UseQueryOptions<FetchBalanceResult, Error, TSelectData>;

type QueryKeyArgs = Partial<FetchBalanceArgs>;

function queryKey({ address, chainId, formatUnits, token }: QueryKeyArgs) {
  return [
    {
      entity: "balance",
      address,
      chainId,
      formatUnits,
      token,
    },
  ] as const;
}

function queryFn({
  queryKey: [{ address, chainId, formatUnits, token }],
}: QueryFunctionArgs<typeof queryKey>) {
  if (!address) throw new Error("address is required");
  return fetchBalance({ address, chainId, formatUnits, token });
}

export function useBalance<TSelectData = FetchBalanceResult>({
  address,
  cacheTime,
  enabled = true,
  formatUnits,
  staleTime,
  suspense,
  token,
  watch,
  select,
  onError,
  onSettled,
  onSuccess,
}: UseBalanceArgs & UseBalanceConfig<TSelectData> = {}) {
  const chainId = useChain();
  const queryKey_ = React.useMemo(
    () => queryKey({ address, chainId, formatUnits, token }),
    [address, chainId, formatUnits, token]
  );
  const balanceQuery = useQuery(queryKey_, queryFn, {
    cacheTime,
    enabled: Boolean(enabled && address),
    staleTime,
    suspense,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    select: (data) => select!(data),
    onError,
    onSettled,
    onSuccess,
  });

  useInvalidateOnBlock({
    chainId,
    enabled: Boolean(enabled && watch && address),
    queryKey: queryKey_,
  });

  return balanceQuery;
}
