import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { utils } from "ethers";
import type { Address } from "wagmi";
import { erc20ABI } from "wagmi";

import { useEnvironment } from "../contexts/useEnvironment";
import { useBalance as useNativeBalance } from "./internal/useBalance";
import { useContractRead } from "./internal/useContractRead";
import type { HookArg } from "./internal/utils";
import { useIsWrappedNative } from "./useTokens";

export const useBalance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();

  const native = environment.interface.native;
  const nativeBalance = useNativeBalance({
    address: address ?? undefined,
    enabled: !!address && !!native,
    staleTime: Infinity,
    watch: true,
    select: (data) =>
      CurrencyAmount.fromRawAmount(
        environment.interface.wrappedNative,
        data.value.toString()
      ),
  });
  const balanceQuery = useContractRead({
    address: token ? utils.getAddress(token.address) : undefined,
    args: address ? [address] : undefined,
    functionName: "balanceOf",
    abi: erc20ABI,
    staleTime: Infinity,
    enabled: !!token && !!address,
    select: (data) =>
      token ? CurrencyAmount.fromRawAmount(token, data.toString()) : undefined,
    watch: true,
  });

  if (useIsWrappedNative(token)) return nativeBalance;
  return balanceQuery;
};
