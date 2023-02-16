import { CurrencyAmount, Price } from "@uniswap/sdk-core";

import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "../../constants/types";
import { borrowRate } from "./jumprate";

export const convertLiquidityToShare = <L extends Lendgine>(
  liquidity: CurrencyAmount<L["lendgine"]>,
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  if (lendgineInfo.totalLiquidityBorrowed.equalTo(0))
    return CurrencyAmount.fromRawAmount(lendgine.lendgine, 0);
  return liquidity.multiply(
    lendgineInfo.totalSupply.divide(lendgineInfo.totalLiquidityBorrowed)
  );
};

export const convertShareToLiquidity = <L extends Lendgine>(
  shares: CurrencyAmount<L["lendgine"]>,
  lendgineInfo: LendgineInfo<L>
) => {
  return lendgineInfo.totalLiquidityBorrowed
    .multiply(shares)
    .divide(lendgineInfo.totalSupply);
};

export const convertCollateralToLiquidity = <L extends Lendgine>(
  collateral: CurrencyAmount<L["token1"]>,
  lendgine: L
) => {
  const f = collateral.divide(lendgine.bound.asFraction.multiply(2));
  return CurrencyAmount.fromFractionalAmount(
    lendgine.lendgine,
    f.numerator,
    f.denominator
  );
};

export const convertLiquidityToCollateral = <L extends Lendgine>(
  liquidity: CurrencyAmount<L["lendgine"]>,
  lendgine: L
) => {
  const f = liquidity.multiply(lendgine.bound.asFraction.multiply(2));
  return CurrencyAmount.fromFractionalAmount(
    lendgine.token1,
    f.numerator,
    f.denominator
  );
};

export const convertLiquidityToPosition = <L extends Lendgine>(
  liquidity: CurrencyAmount<L["lendgine"]>,
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
): CurrencyAmount<L["lendgine"]> => {
  const totalLiquiditySupplied = lendgineInfo.totalLiquidityBorrowed.add(
    lendgineInfo.totalLiquidity
  );
  if (totalLiquiditySupplied.equalTo(0))
    return CurrencyAmount.fromRawAmount(lendgine.lendgine, 0);
  return lendgineInfo.totalPositionSize
    .multiply(liquidity)
    .divide(totalLiquiditySupplied);
};

export const convertPositionToLiquidity = <L extends Lendgine>(
  position: Pick<LendginePosition<L>, "size">,
  lendgineInfo: LendgineInfo<L>
) => {
  const totalLiquiditySupplied = lendgineInfo.totalLiquidityBorrowed.add(
    lendgineInfo.totalLiquidity
  );
  return totalLiquiditySupplied
    .multiply(position.size)
    .divide(lendgineInfo.totalPositionSize);
};

export const liquidityPerShare = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const share = CurrencyAmount.fromRawAmount(lendgine.lendgine, 1);
  const liquidity = convertShareToLiquidity(share, lendgineInfo);

  return new Price({ baseAmount: share, quoteAmount: liquidity });
};

export const liquidityPerCollateral = <L extends Lendgine>(lendgine: L) => {
  const collateral = CurrencyAmount.fromRawAmount(lendgine.token1, 1);
  const liquidity = convertCollateralToLiquidity(collateral, lendgine);

  return new Price({ baseAmount: collateral, quoteAmount: liquidity });
};

export const liquidityPerPosition = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const position = CurrencyAmount.fromRawAmount(lendgine.lendgine, 1);

  const liquidity = convertPositionToLiquidity(
    { size: position },
    lendgineInfo
  );

  return new Price({ baseAmount: position, quoteAmount: liquidity });
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

  const dilutionToken1 = convertLiquidityToCollateral(dilutionLP, lendgine);

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
