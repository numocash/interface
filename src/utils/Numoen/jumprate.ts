import type { Fraction } from "@uniswap/sdk-core";
import { Percent } from "@uniswap/sdk-core";

const kink = new Percent(8, 10);
const multiplier = new Percent(1375, 100000);
const jumpMultiplier = new Percent(89, 200);

export const utilizationRate = (
  totalLiquidity: Fraction,
  totalLiquidityBorrowed: Fraction
): Percent => {
  const totalLiquiditySupplied = totalLiquidity.add(totalLiquidityBorrowed);
  if (totalLiquiditySupplied.equalTo(0)) return new Percent(0);
  const f = totalLiquidityBorrowed.divide(totalLiquiditySupplied);
  return new Percent(f.numerator, f.denominator);
};

export const borrowRate = (
  totalLiquidity: Fraction,
  totalLiquidityBorrowed: Fraction
): Percent => {
  const utilization = utilizationRate(totalLiquidity, totalLiquidityBorrowed);

  if (utilization.greaterThan(kink)) {
    const normalRate = kink.multiply(multiplier).multiply(100);
    const excessUtil = utilization.subtract(kink);
    return excessUtil.multiply(jumpMultiplier).multiply(100).add(normalRate);
  } else {
    return utilization.multiply(multiplier).multiply(100);
  }
};

export const supplyRate = (
  totalLiquidity: Fraction,
  totalLiquidityBorrowed: Fraction
): Percent => {
  const utilization = utilizationRate(totalLiquidity, totalLiquidityBorrowed);

  const borrow = borrowRate(totalLiquidity, totalLiquidityBorrowed);

  return utilization.multiply(borrow);
};
