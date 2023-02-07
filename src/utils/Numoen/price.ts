import { Price } from "@uniswap/sdk-core";

import type { Lendgine } from "../../constants";
import type { LendgineInfo } from "../../hooks/useLendgine";

export const numoenPrice = (lendgine: Lendgine, lendgineInfo: LendgineInfo) => {
  if (lendgineInfo.totalLiquidity.equalTo(0))
    return new Price(lendgine.token1, lendgine.token0, 1, 0);

  const scale1 = lendgineInfo.reserve1.divide(lendgineInfo.totalLiquidity);
  const priceFraction = lendgine.bound.subtract(scale1.divide(2));

  return new Price(
    lendgine.token1,
    lendgine.token0,
    priceFraction.denominator,
    priceFraction.numerator
  );
};
