import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Multicall } from "@dahlia-labs/use-ethers";

import type { IPair } from "../contexts/environment";
import { pairInterface } from "../hooks/useContract";

export const reserve0Multicall = (pair: IPair): Multicall<TokenAmount> =>
  ({
    call: {
      target: pair.address,
      callData: pairInterface.encodeFunctionData("reserve0"),
    },
    parseReturn: (returnData: string) =>
      new TokenAmount(
        pair.baseToken,
        pairInterface.decodeFunctionResult("reserve0", returnData).toString()
      ),
  } as const);

export const reserve1Multicall = (pair: IPair): Multicall<TokenAmount> =>
  ({
    call: {
      target: pair.address,
      callData: pairInterface.encodeFunctionData("reserve1"),
    },
    parseReturn: (returnData: string) =>
      new TokenAmount(
        pair.speculativeToken,
        pairInterface.decodeFunctionResult("reserve1", returnData).toString()
      ),
  } as const);

export const totalSupplyMulticall = (pair: IPair): Multicall<TokenAmount> =>
  ({
    call: {
      target: pair.address,
      callData: pairInterface.encodeFunctionData("totalSupply"),
    },
    parseReturn: (returnData: string) =>
      new TokenAmount(
        pair.lp,
        pairInterface.decodeFunctionResult("totalSupply", returnData).toString()
      ),
  } as const);
