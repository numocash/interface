import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount } from "@uniswap/sdk-core";
import invariant from "tiny-invariant";
import type { Address } from "wagmi";

import {
  useErc20Allowance,
  useErc20Approve,
  usePrepareErc20Approve,
} from "../generated";
import type { HookArg } from "./useBalance";
import type { WrappedTokenInfo } from "./useTokens2";

export const useAllowance = (
  token: HookArg<WrappedTokenInfo>,
  address: HookArg<Address>,
  spender: HookArg<Address>
) => {
  const query = useErc20Allowance({
    address: token ? getAddress(token.address) : undefined,
    args: address && spender ? [address, spender] : undefined,
    watch: true,
    staleTime: Infinity,
    enabled: !!token && !!address && !!spender,
  });

  // This function should be generalized to take the FetchBalanceResult type and then parsing it
  // parse the return type into a more expressive type
  const parseReturn = (balance: (typeof query)["data"]) => {
    if (!balance) return undefined;
    invariant(token); // if a balance is returned then the data passed must be valid
    return CurrencyAmount.fromRawAmount(token, balance.toString());
  };

  // This could be generalized into a function
  // update the query with the parsed data type
  const updatedQuery = {
    ...query,
    data: parseReturn(query.data),
    refetch: async (options: Parameters<(typeof query)["refetch"]>[0]) => {
      const balance = await query.refetch(options);
      return parseReturn(balance.data);
    },
  };

  return updatedQuery;
};

export const useApprove = (
  tokenAmount: HookArg<CurrencyAmount<WrappedTokenInfo>>,
  spender: HookArg<Address>
) => {
  const prepare = usePrepareErc20Approve({
    args:
      !!tokenAmount && !!spender
        ? [spender, BigNumber.from(tokenAmount.asFraction.quotient.toString())]
        : undefined,
    address: tokenAmount
      ? getAddress(tokenAmount?.currency.address)
      : undefined,
    enabled: !!tokenAmount && !!spender,
  });

  const write = useErc20Approve(prepare.config);

  return { prepare, write };
};
