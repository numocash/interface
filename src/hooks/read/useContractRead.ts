import type {
  QueryFunctionContext,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { ReadContractConfig, ReadContractResult } from "@wagmi/core";
import { parseContractResult } from "@wagmi/core";
import type { Abi } from "abitype";
import * as React from "react";
import { useBlockNumber } from "wagmi";
import { readContract } from "wagmi/actions";

import { useChain } from "../useChain";
import { useInvalidateOnBlock } from "../useInvalidateOnBlock";

/**
 * Makes {@link TKeys} optional in {@link TType} while preserving type inference.
 */
// s/o trpc (https://github.com/trpc/trpc/blob/main/packages/server/src/types.ts#L6)
export type PartialBy<TType, TKeys extends keyof TType> = Partial<
  Pick<TType, TKeys>
> &
  Omit<TType, TKeys>;

export type DeepPartial<
  T,
  MaxDepth extends number,
  Depth extends ReadonlyArray<number> = []
> = Depth["length"] extends MaxDepth
  ? T
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P], MaxDepth, [...Depth, 1]> }
  : T;

export type QueryFunctionArgs<T extends (...args: any) => any> =
  QueryFunctionContext<ReturnType<T>>;

export type UseContractReadConfig<
  TAbi extends Abi = Abi,
  TFunctionName extends string = string,
  TSelectData = ReadContractResult<TAbi, TFunctionName>
> = PartialBy<
  ReadContractConfig<TAbi, TFunctionName>,
  "abi" | "address" | "args" | "functionName"
> &
  UseQueryOptions<
    ReadContractResult<TAbi, TFunctionName>,
    Error,
    TSelectData
  > & {
    /** If set to `true`, the cache will depend on the block number */
    cacheOnBlock?: boolean;
    /** Subscribe to changes */
    watch?: boolean;
  };

type QueryKeyArgs = Omit<ReadContractConfig, "abi">;

function queryKey({
  address,
  args,
  chainId,
  functionName,
  overrides,
}: QueryKeyArgs) {
  return [
    {
      entity: "readContract",
      address,
      args,
      chainId,
      functionName,
      overrides,
    },
  ] as const;
}

function queryFn<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string
>({ abi }: { abi?: Abi | readonly unknown[] }) {
  return async ({
    queryKey: [{ address, args, chainId, functionName, overrides }],
  }: QueryFunctionArgs<typeof queryKey>) => {
    if (!abi) throw new Error("abi is required");
    if (!address) throw new Error("address is required");
    return ((await readContract({
      address,
      args,
      chainId,
      // TODO: Remove cast and still support `Narrow<TAbi>`
      abi: abi as Abi,
      functionName,
      overrides,
    })) ?? null) as ReadContractResult<TAbi, TFunctionName>;
  };
}

export function useContractRead<
  TAbi extends Abi,
  TFunctionName extends string,
  TSelectData = ReadContractResult<TAbi, TFunctionName>
>({
  abi,
  address,
  args,
  cacheOnBlock = false,
  cacheTime,
  enabled: enabled_ = true,
  functionName,
  isDataEqual,
  onError,
  onSettled,
  onSuccess,
  overrides,
  select,
  staleTime,
  suspense,
  watch,
}: UseContractReadConfig<TAbi, TFunctionName, TSelectData>) {
  const chainId = useChain();
  const { data: blockNumber } = useBlockNumber({
    chainId,
    enabled: watch || cacheOnBlock,
    scopeKey: watch || cacheOnBlock ? undefined : "idle",
    watch,
  });

  const queryKey_ = React.useMemo(
    () =>
      queryKey({
        address,
        args,
        blockNumber: cacheOnBlock ? blockNumber : undefined,
        chainId,
        functionName,
        overrides,
      } as Omit<ReadContractConfig, "abi">),
    [address, args, blockNumber, cacheOnBlock, chainId, functionName, overrides]
  );

  const enabled = React.useMemo(() => {
    let enabled = Boolean(enabled_ && abi && address && functionName);
    if (cacheOnBlock) enabled = Boolean(enabled && blockNumber);
    return enabled;
  }, [abi, address, blockNumber, cacheOnBlock, enabled_, functionName]);

  useInvalidateOnBlock({
    chainId,
    enabled: Boolean(enabled && watch && !cacheOnBlock),
    queryKey: queryKey_,
  });

  return useQuery(
    queryKey_,
    queryFn({
      // TODO: Remove cast and still support `Narrow<TAbi>`
      abi: abi as Abi,
    }),
    {
      cacheTime,
      enabled,
      isDataEqual,
      select: (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result =
          abi && functionName
            ? parseContractResult({
                // TODO: Remove cast and still support `Narrow<TAbi>`
                abi: abi as Abi,
                data,
                functionName,
              })
            : data;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return select ? select(result) : result;
      },
      staleTime,
      suspense,
      onError,
      onSettled,
      onSuccess,
    }
  );
}
