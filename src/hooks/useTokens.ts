import { getAddress } from "@ethersproject/address";
import type { Token } from "@uniswap/sdk-core";
import { useCallback } from "react";

import { useEnvironment } from "../contexts/environment2";
import type { HookArg } from "./useBalance";
import { useDefaultTokenList } from "./useTokens2";

export const useAddressToToken = (address: HookArg<string>) => {
  return useGetAddressToToken()(address);
};

export const useGetAddressToToken = () => {
  const tokens = useDefaultTokenList();

  return useCallback(
    (address: HookArg<string>) => {
      if (!address) return null;
      return (
        tokens.find((t) => getAddress(t.address) === getAddress(address)) ??
        null
      );
    },
    [tokens]
  );
};

export const useGetIsWrappedNative = () => {
  const enviroment = useEnvironment();
  return <T extends Token>(token: HookArg<T>) => {
    if (!token) return undefined;

    return !enviroment.interface.native
      ? false
      : enviroment.interface.native.wrapped.equals(token);
  };
};
export const useIsWrappedNative = <T extends Token>(token: HookArg<T>) =>
  useGetIsWrappedNative()(token);

export const useTokenSymbol = <T extends Token>(token: HookArg<T>) => {
  const environment = useEnvironment();
  if (useIsWrappedNative(token)) {
    return environment.interface.native?.symbol;
  }
  return token?.symbol;
};
