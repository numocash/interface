import { getAddress } from "@ethersproject/address";
import type { Address } from "wagmi";

import type { LendginesQuery } from "../../gql/numoen/graphql";

export const parseLendgines = (
  lendginesQuery: LendginesQuery
): {
  token0: Address;
  token1: Address;
  token0Exp: number;
  token1Exp: number;
  upperBound: string;
  address: Address;
}[] => {
  return lendginesQuery.lendgines.map((l) => ({
    token0: getAddress(l.token0),
    token1: getAddress(l.token1),
    token0Exp: l.token0Exp,
    token1Exp: l.token1Exp,
    upperBound: l.upperBound,
    address: getAddress(l.id),
  }));
};
