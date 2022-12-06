import type { Multicall, Multicall2 } from "@dahlia-labs/use-ethers";
import { fetchMulticalls } from "@dahlia-labs/use-ethers";
import type { QueryFunction, QueryKey } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import invariant from "tiny-invariant";

import { useBlock } from "../contexts/block";
import { useMulticall } from "./useContract";

export const blockHistory = 10;

export type Return = Awaited<ReturnType<Multicall2["callStatic"]["aggregate"]>>;

export function useBlockMulticall<T extends unknown[]>(
  multicalls: readonly [...{ [I in keyof T]: Multicall<T[I]> }] | null,
  deps: Readonly<QueryKey> | null = null
): Readonly<T> | undefined {
  const multicall = useMulticall();

  const hash = deps !== null ? deps : multicalls ?? [];

  const query = useBlockQuery(
    hash,
    async () => {
      invariant(multicalls, "block mulitcall");
      return (await fetchMulticalls(multicalls, multicall)) as T;
    },
    !!multicalls
  );

  return query.data;
}

export function useBlockQuery<T>(
  deps: Readonly<QueryKey>,
  queryFn: QueryFunction<T, unknown[]>,
  enabled: boolean,
  block = true
) {
  const { blocknumber } = useBlock();
  const queryClient = useQueryClient();
  return useQuery(
    [...deps, block ? blockFilter(blocknumber ?? 0) : null],
    queryFn,
    {
      staleTime: Infinity,
      placeholderData:
        block && blocknumber
          ? [...Array(blockHistory).keys()]
              .map((i) => blockFilter(blocknumber) - i - 1)
              .reduce((acc, cur: number) => {
                return acc ? acc : queryClient.getQueryData([...deps, cur]);
              }, undefined) ?? queryClient.getQueryData([...deps, 0])
          : undefined,
      enabled,
    }
  );
}

const blockMap = 1;

const blockFilter = (blocknumber: number) => Math.floor(blocknumber / blockMap);
