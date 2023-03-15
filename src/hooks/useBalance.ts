import { getAddress } from "@ethersproject/address";
import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { Address } from "wagmi";
import {
  erc20ABI,
  useBalance as useWagmiBalance,
  useContractReads,
} from "wagmi";

import { useEnvironment } from "../contexts/environment2";
import { useErc20BalanceOf } from "../generated";
import { useIsWrappedNative } from "./useTokens";

export type HookArg<T> = T | null | undefined;

export const useNativeBalance = (address: HookArg<Address>) => {
  const environment = useEnvironment();

  const native = environment.interface.native;

  const balanceQuery = useWagmiBalance({
    address: address ?? undefined,
    staleTime: 3_000,
    enabled: !!address && !!native,
    scopeKey: "nativeBalance",
  });

  const parseReturn = (balance: (typeof balanceQuery)["data"]) => {
    if (!balance) return undefined;
    return CurrencyAmount.fromRawAmount(
      environment.interface.wrappedNative,
      balance.value.toString()
    );
  };

  // update the query with the parsed data type
  const updatedQuery = {
    ...balanceQuery,
    data: parseReturn(balanceQuery.data),
    refetch: async (
      options: Parameters<(typeof balanceQuery)["refetch"]>[0]
    ) => {
      const balance = await balanceQuery.refetch(options);
      return parseReturn(balance.data);
    },
  };

  return updatedQuery;
};

// how can the return type be determined
export const useBalance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>
) => {
  const nativeBalance = useNativeBalance(address);
  const balanceQuery = useErc20BalanceOf({
    address: token ? getAddress(token.address) : undefined,
    args: address ? [address] : undefined,
    staleTime: 3_000,
    enabled: !!token && !!address,
    select: (data) =>
      token ? CurrencyAmount.fromRawAmount(token, data.toString()) : undefined,
    scopeKey: "erc20Balance",
  });

  if (useIsWrappedNative(token)) return nativeBalance;
  return balanceQuery;
};

// accept a tuple of tokens
// must get contractRead to be strictly typed
// return a tuple of currency amounts
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
                address: getAddress(t.address),
                abi: erc20ABI,
                functionName: "balanceOf",
                args: [address],
              } as const)
          )
        : undefined,
    [address, tokens]
  );

  return useContractReads({
    //  ^?
    contracts,
    allowFailure: false,
    staleTime: 3_000,
    enabled: !!tokens && !!address,
    select: (data) =>
      tokens
        ? data.map((d, i) =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            CurrencyAmount.fromRawAmount(tokens[i]!, d.toString())
          )
        : undefined,
    scopeKey: "erc20balances",
  });
};
