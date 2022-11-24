import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Multicall } from "@dahlia-labs/use-ethers";

import type { IMarket } from "../contexts/environment";
import { lendgineInterface } from "../hooks/useContract";

export const totalLiquidityMulticall = (
  market: IMarket
): Multicall<TokenAmount> =>
  ({
    call: {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("totalLiquidity"),
    },
    parseReturn: (returnData: string) =>
      new TokenAmount(
        market.pair.lp,
        lendgineInterface
          .decodeFunctionResult("totalLiquidity", returnData)
          .toString()
      ),
  } as const);

export const totalLiquidityBorrowedMulticall = (
  market: IMarket
): Multicall<TokenAmount> =>
  ({
    call: {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("totalLiquidityBorrowed"),
    },
    parseReturn: (returnData: string) =>
      new TokenAmount(
        market.pair.lp,
        lendgineInterface
          .decodeFunctionResult("totalLiquidityBorrowed", returnData)
          .toString()
      ),
  } as const);

export const rewardPerLiquidityStoredMulticall = (
  market: IMarket
): Multicall<TokenAmount> =>
  ({
    call: {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData(
        "rewardPerLiquidityStored"
      ),
    },
    parseReturn: (returnData: string) =>
      new TokenAmount(
        market.pair.speculativeToken,
        lendgineInterface
          .decodeFunctionResult("rewardPerLiquidityStored", returnData)
          .toString()
      ),
  } as const);

export const totalSupplyMulticall = (market: IMarket): Multicall<TokenAmount> =>
  ({
    call: {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("totalSupply"),
    },
    parseReturn: (returnData: string) =>
      new TokenAmount(
        market.token,
        lendgineInterface
          .decodeFunctionResult("totalSupply", returnData)
          .toString()
      ),
  } as const);

export const lastUpdateMulticall = (market: IMarket): Multicall<number> =>
  ({
    call: {
      target: market.address,
      callData: lendgineInterface.encodeFunctionData("lastUpdate"),
    },
    parseReturn: (returnData: string) =>
      +lendgineInterface
        .decodeFunctionResult("lastUpdate", returnData)
        .toString(),
  } as const);
