import { markets } from "@dahlia-labs/numoen-config";
import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token } from "@dahlia-labs/token-utils";
import { useCallback } from "react";
import { createContainer } from "unstated-next";

import { useChain } from "../hooks/useChain";

interface Environment {
  markets: readonly IMarket[];
}

export const useAddressToMarket = (
  address: string | null | undefined
): IMarket | null => {
  const { markets } = useEnvironment();
  if (!address) return null;

  return (
    markets.find((m) => m.address.toLowerCase() === address.toLowerCase()) ??
    null
  );
};

export const useGetAddressToMarket = () => {
  const { markets } = useEnvironment();
  return useCallback(
    (address: string | null | undefined) => {
      if (!address) return null;
      return (
        markets.find(
          (m) => m.address.toLowerCase() === address.toLowerCase()
        ) ?? null
      );
    },
    [markets]
  );
};

export const useGetSpeculativeToMarket = () => {
  const { markets } = useEnvironment();
  return useCallback(
    (speculative: Token) => {
      return markets.find((m) => m.pair.speculativeToken === speculative);
    },
    [markets]
  );
};

export const useIsMarket = (address: string | null): boolean => {
  const environment = useEnvironment();
  if (address === null) return false;
  return environment.markets.map((m) => m.address).includes(address);
};

const useEnvironmentInternal = (): Environment => {
  const chain = useChain();
  return {
    markets: markets[chain],
  };
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const ModelMarket = markets.arbitrum[3]!;

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
