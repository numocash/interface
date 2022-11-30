import type { IMarketInfo } from "@dahlia-labs/numoen-utils";
import { Percent } from "@dahlia-labs/token-utils";

const kink = new Percent(8, 10);
const multiplier = new Percent(1375, 100000);
const jumpMultiplier = new Percent(89, 200);

export const borrowRate = (marketInfo: IMarketInfo): Percent => {
  if (marketInfo.totalLiquidity.equalTo(0)) return new Percent(0);
  const utilization = Percent.fromFraction(
    marketInfo.totalLiquidityBorrowed.divide(marketInfo.totalLiquidity)
  );

  if (utilization.greaterThan(kink)) {
    const normalRate = kink.multiply(multiplier);
    const excessUtil = utilization.subtract(kink);
    return excessUtil.multiply(jumpMultiplier).add(normalRate);
  } else {
    return utilization.multiply(multiplier).multiply(100);
  }
};

export const supplyRate = (marketInfo: IMarketInfo): Percent => {
  if (marketInfo.totalLiquidity.equalTo(0)) return new Percent(0);
  const utilization = Percent.fromFraction(
    marketInfo.totalLiquidityBorrowed.divide(marketInfo.totalLiquidity)
  );

  const borrow = borrowRate(marketInfo);

  return utilization.multiply(borrow);
};
