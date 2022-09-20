import { ChainId } from "@dahlia-labs/celo-contrib";
import { CELO, CUSD } from "@dahlia-labs/celo-tokens";
import type { Token } from "@dahlia-labs/token-utils";
import { Fraction } from "@dahlia-labs/token-utils";
import { AddressZero } from "@ethersproject/constants";
import { createContainer } from "unstated-next";

export interface IMarket {
  bound: Fraction;
  speculativeToken: Token;
  baseToken: Token;
  address: string;
  pairAddress: string;
}

interface Environment {
  markets: readonly IMarket[];
}

const testMarket: IMarket = {
  bound: new Fraction(2),
  speculativeToken: CELO[ChainId.Mainnet],
  baseToken: CUSD[ChainId.Mainnet],
  address: "0xE2eeEBAf210502aA815008618C89CA9d98d97924",
  pairAddress: AddressZero,
};

const testMarket1: IMarket = {
  bound: new Fraction(15, 2),
  speculativeToken: CELO[ChainId.Mainnet],
  baseToken: CUSD[ChainId.Mainnet],
  address: "0xE2eeEBAf210502aA815008618C89CA9d98d97924",
  pairAddress: AddressZero,
};

export const useIsMarket = (address: string | null): boolean => {
  const environment = useEnvironment();
  if (address === null) return false;
  return environment.markets.map((m) => m.address).includes(address);
};

const useEnvironmentInternal = (): Environment => {
  return {
    markets: [testMarket] as const,
  };
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
