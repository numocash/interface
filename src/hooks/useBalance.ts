import { getAddress } from "@ethersproject/address";
import type { BigNumber } from "@ethersproject/bignumber";
import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import invariant from "tiny-invariant";
import type { Address } from "wagmi";
import { erc20ABI, useContractReads } from "wagmi";

import { useErc20BalanceOf } from "../generated";
import type { HookArg } from "./useApproval";

// how can the return type be determined
export const useBalance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>
) => {
  const balanceQuery = useErc20BalanceOf({
    address: token ? getAddress(token.address) : undefined,
    args: address ? [address] : undefined,
    watch: true,
    staleTime: Infinity,
    enabled: !!token && !!address,
  });

  // This function should be generalized to take the FetchBalanceResult type and then parsing it
  // parse the return type into a more expressive type
  const parseReturn = (balance: (typeof balanceQuery)["data"]) => {
    if (!balance) return undefined;
    invariant(token && address); // if a balance is returned then the data passed must be valid
    return CurrencyAmount.fromRawAmount(token, balance.toString());
  };

  // This could be generalized into a function
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

export const useBalances = <T extends Token>(
  tokens: HookArg<readonly T[]>,
  address: HookArg<Address>
) => {
  const contracts =
    !!tokens && !!address
      ? tokens.map((t) => ({
          address: getAddress(t.address),
          abi: erc20ABI,
          functionName: "balanceOf",
          args: [address],
        }))
      : undefined;

  const contractRead = useContractReads({
    contracts,
    allowFailure: true,
    watch: true,
    staleTime: Infinity,
    enabled: !!tokens && !!address,
  });

  const data: BigNumber[] | undefined = contractRead.data as
    | BigNumber[]
    | undefined;

  return data
    ? data.map((d, i) => {
        invariant(tokens);
        const token = tokens[i];
        invariant(token);
        return CurrencyAmount.fromRawAmount(token, d.toString());
      })
    : undefined;
};

// export const useBalance = (
//   currency: HookArg<Currency>,
//   address: HookArg<Address>
// ) => {
//   const balanceQuery = useBalanceWagmi({
//     address: address ?? undefined,
//     token: currency?.isToken ? getAddress(currency.address) : undefined,
//     watch: true, // updates on new blocks
//     staleTime: Infinity, // will only invalidate when a new block comes
//     enabled: !!currency && !!address,
//   });

//   // This function should be generalized to take the FetchBalanceResult type and then parsing it
//   // parse the return type into a more expressive type
//   const parseReturn = (balance: (typeof balanceQuery)["data"]) => {
//     if (!balance) return undefined;
//     invariant(currency && address); // if a balance is returned then the data passed must be valid
//     return CurrencyAmount.fromRawAmount(currency, balance.value.toString());
//   };

//   // This could be generalized into a function
//   // update the query with the parsed data type
//   const updatedQuery = {
//     ...balanceQuery,
//     data: parseReturn(balanceQuery.data),
//     refetch: async (
//       options: Parameters<(typeof balanceQuery)["refetch"]>[0]
//     ) => {
//       const balance = await balanceQuery.refetch(options);
//       return parseReturn(balance.data);
//     },
//   };

//   return updatedQuery;
// };
