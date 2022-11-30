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

import { lendgineAddress } from "./lendgineAddress";

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
        data.tokensOwed.toString()
      ),
    };
  },
});
