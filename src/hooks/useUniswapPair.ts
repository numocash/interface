import type { IMarket } from "@dahlia-labs/numoen-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import type { IUniswapV2Pair } from "@dahlia-labs/uniswapv2-utils";
import { pairInterface } from "@dahlia-labs/uniswapv2-utils";
import type { Multicall } from "@dahlia-labs/use-ethers";
import type { BigNumber } from "ethers";
import invariant from "tiny-invariant";

import { useBlockMulticall } from "./useBlockQuery";

// TODO: fix this in the library
export const reservesMulticall = (
  pair: IUniswapV2Pair
): Multicall<Readonly<[TokenAmount, TokenAmount]>> =>
  ({
    call: {
      target: pair.address,
      callData: pairInterface.encodeFunctionData("getReserves"),
    },
    parseReturn: (returnData: string) => {
      const data = pairInterface.decodeFunctionResult(
        "getReserves",
        returnData
      ) as [BigNumber, BigNumber];
      return [
        new TokenAmount(pair.tokens[0], data[0].toString()),
        new TokenAmount(pair.tokens[1], data[1].toString()),
      ] as const;
    },
  } as const);

export const useUniswapPair = (
  market: IMarket | null
): [TokenAmount, TokenAmount] | null => {
  const data = useBlockMulticall(
    market ? [reservesMulticall(market.referenceMarket)] : null
  );

  if (!data) return null;
  invariant(market);

  const baseFirst =
    market.pair.baseToken.address < market.pair.speculativeToken.address;

  return [
    baseFirst ? data[0][0] : data[0][1],
    baseFirst ? data[0][1] : data[0][0],
  ];
};
