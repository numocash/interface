import type { Call, Multicall2 } from "@dahlia-labs/use-ethers";
import type { QueryKey } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useBlock } from "../contexts/block";
import { useMulticall } from "./useContract";

export const blockHistory = 10;

export type Return = Awaited<ReturnType<Multicall2["callStatic"]["aggregate"]>>;

type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};

export const useBlockQuery = (
  name: string,
  calls: readonly Call[],
  deps: Readonly<QueryKey> | null = null,
  block = true
): Return | undefined => {
  const { blocknumber } = useBlock();
  const queryClient = useQueryClient();
  const multicall = useMulticall();

  const hash = deps !== null ? deps : calls;

  const query = useQuery(
    [name, ...hash, block ? blocknumber ?? 0 : null],
    async () =>
      await multicall.callStatic.aggregate(calls as CreateMutable<Call[]>),
    {
      staleTime: Infinity,
      placeholderData:
        block && blocknumber
          ? [...Array(blockHistory).keys()]
              .map((i) => blocknumber - i - 1)
              .reduce((acc, cur: number) => {
                return acc
                  ? acc
                  : queryClient.getQueryData([name, ...hash, cur]);
              }, undefined) ?? queryClient.getQueryData([name, ...hash, 0])
          : undefined,
    }
  );

  return query.data;
};
