import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useBlock } from "../contexts/block";
import { useMulticall } from "./useContract";

export interface Call {
  target: string;
  callData: string;
}

const blockHistory = 10;

export const useBlockQuery = (
  name: string,
  calls: Call[],
  deps: (string | number | boolean | null | undefined)[] | null = null,
  block = true
) => {
  const { blocknumber } = useBlock();
  const queryClient = useQueryClient();
  const multicall = useMulticall();

  const hash = deps !== null ? deps : calls;

  const query = useQuery(
    [name, ...hash, block ? blocknumber ?? 0 : null],
    async () => await multicall?.callStatic.aggregate(calls),
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

  return query;
};
