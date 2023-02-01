import { getAddress } from "@ethersproject/address";
import type { BigNumber } from "@ethersproject/bignumber";
import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import type {
  Abi,
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  AbiStateMutability,
  Address,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
  Narrow,
} from "abitype";
import invariant from "tiny-invariant";
import { erc20ABI, useContractReads } from "wagmi";

import { useEnvironment } from "../contexts/environment2";
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

export type Contract<
  TAbi extends Abi | readonly unknown[] = Abi | readonly unknown[],
  TFunctionName extends string = string
> = { abi: TAbi; functionName: TFunctionName };

export type GetConfig<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAbiStateMutability extends AbiStateMutability = AbiStateMutability
> = {
  /** Contract ABI */
  abi: Narrow<TAbi>; // infer `TAbi` type for inline usage
  /** Contract address */
  address: Address;
  /** Function to invoke on the contract */
  functionName: GetFunctionName<TAbi, TFunctionName, TAbiStateMutability>;
} & GetArgs<TAbi, TFunctionName>;

export type GetFunctionName<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAbiStateMutability extends AbiStateMutability = AbiStateMutability
> = TAbi extends Abi
  ? ExtractAbiFunctionNames<
      TAbi,
      TAbiStateMutability
    > extends infer AbiFunctionNames
    ?
        | AbiFunctionNames
        | (TFunctionName extends AbiFunctionNames ? TFunctionName : never)
        | (Abi extends TAbi ? string : never)
    : never
  : TFunctionName;

export type GetArgs<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAbiFunction extends AbiFunction & { type: "function" } = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction & { type: "function" },
  TArgs = AbiParametersToPrimitiveTypes<TAbiFunction["inputs"]>,
  FailedToParseArgs =
    | ([TArgs] extends [never] ? true : false)
    | (readonly unknown[] extends TArgs ? true : false)
> = true extends FailedToParseArgs
  ? {
      /**
       * Arguments to pass contract method
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on {@link abi} for type inference.
       */
      args?: readonly unknown[];
    }
  : TArgs extends readonly []
  ? { args?: never }
  : {
      /** Arguments to pass contract method */ args: TArgs;
    };

// accept a tuple of tokens
// must get contractRead to be strictly typed
// return a tuple of currency amounts
export const useBalances = <T extends readonly Token[]>(
  tokens: HookArg<T>,
  address: HookArg<Address>
) => {
  // const contracts =
  //   !!tokens && !!address
  //     ? tokens.map((t) => ({
  //         address: getAddress(t.address),
  //         abi: erc20ABI,
  //         functionName: "balanceOf",
  //         args: [address],
  //       }))
  //     : undefined;

  const environment = useEnvironment();

  const ts = [
    environment.interface.stablecoin,
    environment.interface.wrappedNative,
  ] as const;

  const contracts = address
    ? ts.map(
        (t) =>
          ({
            address: getAddress(t.address),
            abi: erc20ABI,
            functionName: "balanceOf",
            args: [address],
          } as const)
      )
    : undefined;

  // const contracts = address
  //   ? ([
  //       {
  //         address: getAddress(environment.interface.stablecoin.address),
  //         abi: erc20ABI,
  //         functionName: "balanceOf",
  //         args: [address],
  //       },
  //       {
  //         address: getAddress(environment.interface.wrappedNative.address),
  //         abi: erc20ABI,
  //         functionName: "balanceOf",
  //         args: [address],
  //       },
  //     ] as const)
  //   : undefined;

  const contractRead = useContractReads({
    //  ^?
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
