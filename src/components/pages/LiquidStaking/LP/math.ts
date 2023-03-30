import { liquidityPerCollateral } from "../../../../lib/lendgineMath";
import { borrowRate } from "../../../../lib/liquidStakingJumprate";
import {
  fractionToPrice,
  priceToFraction,
  tokenToFraction,
} from "../../../../lib/price";
import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "../../../../lib/types/lendgine";

export const accruedLendgineInfo = <L extends Lendgine>(
  lendgine: Lendgine,
  lendgineInfo: LendgineInfo<L>,
  t: number
): LendgineInfo<L> => {
  if (
    lendgineInfo.totalSupply.equalTo(0) ||
    lendgineInfo.totalLiquidityBorrowed.equalTo(0)
  )
    return lendgineInfo;

  const timeElapsed = t - lendgineInfo.lastUpdate;

  const br = borrowRate(lendgineInfo);
  const dilutionLPRequested = lendgineInfo.totalLiquidityBorrowed
    .multiply(br)
    .multiply(timeElapsed)
    .divide(86400 * 365);
  const dilutionLP = dilutionLPRequested.greaterThan(
    lendgineInfo.totalLiquidityBorrowed
  )
    ? lendgineInfo.totalLiquidityBorrowed
    : dilutionLPRequested;

  const liqPerCol = liquidityPerCollateral(lendgine);

  const dilutionToken1 = liqPerCol.invert().quote(dilutionLP);

  const f = priceToFraction(lendgineInfo.rewardPerPositionStored).add(
    tokenToFraction(dilutionToken1).divide(
      tokenToFraction(lendgineInfo.totalPositionSize)
    )
  );

  return {
    ...lendgineInfo,
    totalLiquidityBorrowed:
      lendgineInfo.totalLiquidityBorrowed.subtract(dilutionLP),
    rewardPerPositionStored: fractionToPrice(
      f,
      lendgine.lendgine,
      lendgine.token1
    ),
  };
};

export const accruedLendginePositionInfo = <L extends Lendgine>(
  lendgineInfo: LendgineInfo<L>,
  lendginePosition: LendginePosition<L>
): LendginePosition<L> => {
  const newTokensOwed = lendgineInfo.rewardPerPositionStored
    .quote(lendginePosition.size)
    .subtract(
      lendginePosition.rewardPerPositionPaid.quote(lendginePosition.size)
    );

  return {
    ...lendginePosition,
    tokensOwed: lendginePosition.tokensOwed.add(newTokensOwed),
    rewardPerPositionPaid: lendgineInfo.rewardPerPositionStored,
  };
};
