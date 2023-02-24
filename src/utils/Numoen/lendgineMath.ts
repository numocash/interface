import { CurrencyAmount, Fraction, Price } from "@uniswap/sdk-core";

import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "../../constants/types";
import { borrowRate } from "./jumprate";
import { fractionToPrice, priceToFraction } from "./price";

export const liquidityPerShare = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  if (lendgineInfo.totalSupply.equalTo(0))
    return fractionToPrice(
      new Fraction(1, 1),
      lendgine.lendgine,
      lendgine.lendgine
    );
  const f = lendgineInfo.totalLiquidity.divide(lendgineInfo.totalSupply);
  return fractionToPrice(f, lendgine.lendgine, lendgine.lendgine);
};

export const liquidityPerCollateral = <L extends Lendgine>(lendgine: L) => {
  const f = new Fraction(1).divide(priceToFraction(lendgine.bound).multiply(2));
  return fractionToPrice(f, lendgine.token1, lendgine.lendgine);
};

export const liquidityPerPosition = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const totalLiquiditySupplied = lendgineInfo.totalLiquidityBorrowed.add(
    lendgineInfo.totalLiquidity
  );
  if (lendgineInfo.totalPositionSize.equalTo(0))
    return fractionToPrice(
      new Fraction(1, 1),
      lendgine.lendgine,
      lendgine.lendgine
    );
  const f = totalLiquiditySupplied.divide(lendgineInfo.totalPositionSize);
  return fractionToPrice(f, lendgine.lendgine, lendgine.lendgine);
};

export const accruedLendgineInfo = <L extends Lendgine>(
  lendgine: Lendgine,
  lendgineInfo: LendgineInfo<L>
): LendgineInfo<L> => {
  if (
    lendgineInfo.totalSupply.equalTo(0) ||
    lendgineInfo.totalLiquidityBorrowed.equalTo(0)
  )
    return lendgineInfo;

  const t = Math.round(Date.now() / 1000);
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

  const f = lendgineInfo.rewardPerPositionStored.add(
    dilutionToken1.divide(lendgineInfo.totalPositionSize)
  );

  return {
    ...lendgineInfo,
    totalLiquidityBorrowed:
      lendgineInfo.totalLiquidityBorrowed.subtract(dilutionLP),
    rewardPerPositionStored: new Price(
      lendgine.lendgine,
      lendgine.token1,
      f.denominator,
      f.numerator
    ),
  };
};

export const accruedLendginePositionInfo = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>,
  lendginePosition: LendginePosition<L>
): LendginePosition<L> => {
  const f = lendginePosition.size.multiply(
    lendgineInfo.rewardPerPositionStored.subtract(
      lendginePosition.rewardPerPositionPaid
    )
  );
  return {
    ...lendginePosition,
    tokensOwed: lendginePosition.tokensOwed.add(
      CurrencyAmount.fromFractionalAmount(
        lendgine.token1,
        f.numerator,
        f.denominator
      )
    ),
  };
};
