import { CurrencyAmount } from "@uniswap/sdk-core";

import { calculateBorrowRate } from "./jumprate";
import { liquidityPerCollateral } from "./lendgineMath";
import { fractionToPrice, priceToFraction, tokenToFraction } from "./price";
import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "./types/lendgine";

export const calculateAccrual = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
): LendgineInfo<L> => {
  if (
    lendgineInfo.totalSupply.equalTo(0) ||
    lendgineInfo.totalLiquidityBorrowed.equalTo(0)
  )
    return lendgineInfo;
  const t = Date.now() / 1000;
  const timeElapsed = t - lendgineInfo.lastUpdate;

  const br = calculateBorrowRate(lendgineInfo); // TODO: selector for which constants to use
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

export const calculatePositonAccrual = <L extends Lendgine>(
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

export const calculateEstimatedTokensOwed = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>,
  lendginePosition: LendginePosition<L>
): CurrencyAmount<L["token1"]> => {
  return calculatePositonAccrual(
    calculateAccrual(lendgine, lendgineInfo),
    lendginePosition
  ).tokensOwed;
};

export const calculateEstimatedDepositAmount = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>,
  liquidity: CurrencyAmount<L["lendgine"]>
): { size: CurrencyAmount<L["lendgine"]> } => {
  const accruedLendgineInfo = calculateAccrual(lendgine, lendgineInfo);

  const totalLiquiditySupplied = accruedLendgineInfo.totalLiquidityBorrowed.add(
    accruedLendgineInfo.totalLiquidity
  );

  if (totalLiquiditySupplied.equalTo(0)) return { size: liquidity };

  return {
    size: liquidity
      .multiply(accruedLendgineInfo.totalPositionSize)
      .divide(totalLiquiditySupplied),
  };
};

export const calculateEstimatedWithdrawAmount = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>,
  position: Pick<LendginePosition<L>, "size">
): { liquidity: CurrencyAmount<L["lendgine"]> } => {
  const accruedLendgineInfo = calculateAccrual(lendgine, lendgineInfo);

  const totalLiquiditySupplied = accruedLendgineInfo.totalLiquidityBorrowed.add(
    accruedLendgineInfo.totalLiquidity
  );

  return {
    liquidity: position.size
      .multiply(totalLiquiditySupplied)
      .divide(accruedLendgineInfo.totalPositionSize),
  };
};

export const calculateEstimatedMintAmount = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>,
  collateral: CurrencyAmount<L["token1"]>
): {
  liquidity: CurrencyAmount<L["lendgine"]>;
  balance: CurrencyAmount<L["lendgine"]>;
} => {
  // convert collateral to liquidity
  const f = collateral.divide(priceToFraction(lendgine.bound).multiply(2));
  const liquidity = CurrencyAmount.fromFractionalAmount(
    lendgine.lendgine,
    f.numerator,
    f.denominator
  );

  // convert liquidity to balance
  const accruedLendgineInfo = calculateAccrual(lendgine, lendgineInfo);

  if (accruedLendgineInfo.totalLiquidityBorrowed.equalTo(0))
    return { liquidity, balance: liquidity };

  return {
    liquidity,
    balance: liquidity
      .multiply(accruedLendgineInfo.totalSupply)
      .divide(accruedLendgineInfo.totalLiquidityBorrowed),
  };
};

export const calculateEstimatedBurnAmount = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>,
  balance: CurrencyAmount<L["lendgine"]>
): {
  liquidity: CurrencyAmount<L["lendgine"]>;
  collateral: CurrencyAmount<L["token1"]>;
} => {
  // convert balance to liquidity
  const accruedLendgineInfo = calculateAccrual(lendgine, lendgineInfo);

  const liquidity = accruedLendgineInfo.totalLiquidityBorrowed
    .multiply(balance)
    .divide(accruedLendgineInfo.totalSupply);

  // convert liquidty to collateral
  const f = liquidity.multiply(priceToFraction(lendgine.bound).multiply(2));

  const collateral = CurrencyAmount.fromFractionalAmount(
    lendgine.token1,
    f.numerator,
    f.denominator
  );

  return { liquidity, collateral };
};

export const calculateEstimatedPairBurnAmount = <L extends Lendgine>(
  lendgineInfo: LendgineInfo<L>,
  liquidity: CurrencyAmount<L["lendgine"]>
): {
  amount0: CurrencyAmount<L["token0"]>;
  amount1: CurrencyAmount<L["token1"]>;
} => {
  return {
    amount0: lendgineInfo.reserve0
      .multiply(liquidity)
      .divide(lendgineInfo.totalLiquidity),
    amount1: lendgineInfo.reserve1
      .multiply(liquidity)
      .divide(lendgineInfo.totalLiquidity),
  };
};
