import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Call } from "@dahlia-labs/use-ethers";
import { AddressZero } from "@ethersproject/constants";
import type { BigNumber } from "ethers";

import type { IMarket } from "../contexts/environment";
import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import { useBlockQuery } from "./useBlockQuery";
import { uniswapPairInterface } from "./useContract";

export const useUniswapPair = (
  market: IMarket | null
): [TokenAmount, TokenAmount] | null => {
  const calls: Call[] = [
    {
      target: market?.referenceMarket ?? AddressZero,
      callData: uniswapPairInterface.encodeFunctionData("getReserves"),
    },
  ];

  const data = useBlockQuery("uni reference", calls);

  if (!data || !market) return null;

  interface ret {
    reserve0: BigNumber;
    reserve1: BigNumber;
  }

  const returnData = parseFunctionReturn(
    uniswapPairInterface,
    "getReserves",
    data.returnData[0]
  ) as unknown as ret;

  const baseFirst =
    market.pair.baseToken.address < market.pair.speculativeToken.address;

  return [
    new TokenAmount(
      market.pair.baseToken,
      baseFirst
        ? returnData.reserve0.toString()
        : returnData.reserve1.toString()
    ),
    new TokenAmount(
      market.pair.speculativeToken,
      baseFirst
        ? returnData.reserve1.toString()
        : returnData.reserve0.toString()
    ),
  ];
};
