import { getAddress } from "@ethersproject/address";
import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import type { Address } from "wagmi";
import { erc20ABI } from "wagmi";

import { useContractRead } from "./internal/useContractRead";
import type { HookArg } from "./internal/utils";

export const useAllowance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>,
  spender: HookArg<Address>
) => {
  return useContractRead({
    address: token ? getAddress(token.address) : undefined,
    args: address && spender ? [address, spender] : undefined,
    staleTime: Infinity,
    enabled: !!token && !!address && !!spender,
    abi: erc20ABI,
    functionName: "allowance",
    watch: true,
    select: (data) =>
      token ? CurrencyAmount.fromRawAmount(token, data.toString()) : undefined,
  });
};
