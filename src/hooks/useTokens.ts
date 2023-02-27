import { getAddress } from "@ethersproject/address";
import { useCallback } from "react";

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
