import { getAddress } from "@ethersproject/address";
import { useCallback } from "react";

import type { HookArg } from "./useBalance";
import { useDefaultTokenList } from "./useTokens2";

export const useAddressToToken = (address: HookArg<string>) => {
  return useGetAddressToToken()(address);
};

export const useGetAddressToToken = () => {
  const tokensQuery = useDefaultTokenList();

  return useCallback(
    (address: HookArg<string>) => {
      if (!address || tokensQuery.isLoading || !tokensQuery.data) return null;
      return (
        tokensQuery.data.find(
          (t) => getAddress(t.address) === getAddress(address)
        ) ?? null
      );
    },
    [tokensQuery.data, tokensQuery.isLoading]
  );
};
