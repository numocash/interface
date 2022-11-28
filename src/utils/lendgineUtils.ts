import type {
  ChainsV1,
  IMarket,
  IMarketUserInfo,
} from "@dahlia-labs/numoen-utils";
import {
  LIQUIDITYMANAGER,
  liquidityManagerInterface,
} from "@dahlia-labs/numoen-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Multicall } from "@dahlia-labs/use-ethers";
import type { BigNumber } from "@ethersproject/bignumber";
import invariant from "tiny-invariant";

import { scale } from "../components/pages/Trade/useTrade";

export const getPositionMulticall2 = (
  tokenID: number,
  markets: readonly IMarket[],
  chainID: ChainsV1
): Multicall<IMarketUserInfo> => ({
  call: {
    target: LIQUIDITYMANAGER[chainID],
    callData: liquidityManagerInterface.encodeFunctionData("getPosition", [
      tokenID,
    ]),
  },
  parseReturn: (returnData: string) => {
    const data = liquidityManagerInterface.decodeFunctionResult(
      "getPosition",
      returnData
    ) as unknown as {
      liquidity: BigNumber;
      rewardPerLiquidityPaid: BigNumber;
      tokensOwed: BigNumber;
      base: BigNumber;
      speculative: BigNumber;
      baseScaleFactor: BigNumber;
      speculativeScaleFactor: BigNumber;
      upperBound: BigNumber;
    };

    const market = lendgineAddress(
      {
        base: data.base.toString(),
        speculative: data.speculative.toString(),
        baseScaleFactor: +data.baseScaleFactor.toString(),
        speculativeScaleFactor: +data.speculativeScaleFactor.toString(),
        upperBound: data.upperBound.toString(),
      },
      markets
    );

    invariant(market, "Market not found");

    return {
      tokenID,
      market,
      liquidity: new TokenAmount(market.pair.lp, data.liquidity.toString()),
      rewardPerLiquidityPaid: new TokenAmount(
        market.pair.speculativeToken,
        data.rewardPerLiquidityPaid.toString()
      ),
      tokensOwed: new TokenAmount(
        market.pair.speculativeToken,
        data.rewardPerLiquidityPaid.toString()
      ),
    };
  },
});

interface LendgineProps {
  base: string;
  speculative: string;
  baseScaleFactor: number;
  speculativeScaleFactor: number;
  upperBound: string;
}

export const lendgineAddress = (
  lendgineProps: LendgineProps | null,
  markets: readonly IMarket[]
): IMarket | null => {
  if (!lendgineProps) return null;
  return (
    markets.find(
      (m) =>
        m.pair.speculativeToken.address.toLowerCase() ===
          lendgineProps.speculative.toLowerCase() &&
        m.pair.baseToken.address.toLowerCase() ===
          lendgineProps.base.toLowerCase() &&
        m.pair.baseScaleFactor === lendgineProps.baseScaleFactor &&
        m.pair.speculativeScaleFactor ===
          lendgineProps.speculativeScaleFactor &&
        m.pair.bound.asFraction.multiply(scale).quotient.toString() ===
          lendgineProps.upperBound
    ) ?? null
  );
};
