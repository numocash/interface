import { getAddress } from "@ethersproject/address";
import { Fraction } from "@uniswap/sdk-core";
import type { Address } from "abitype";

import type { LendginesQuery } from "../../gql/numoen/graphql";
import { scale } from "../../utils/Numoen/trade";

export type RawLendgine = {
  token0: Address;
  token1: Address;
  token0Exp: number;
  token1Exp: number;
  upperBound: Fraction;
  address: Address;
};

export const parseLendgines = (
  lendginesQuery: LendginesQuery
): RawLendgine[] => {
  return lendginesQuery.lendgines.map((l) => ({
    token0: getAddress(l.token0),
    token1: getAddress(l.token1),
    token0Exp: l.token0Exp,
    token1Exp: l.token1Exp,
    upperBound: new Fraction(l.upperBound, scale),
    address: getAddress(l.id),
  }));
};
