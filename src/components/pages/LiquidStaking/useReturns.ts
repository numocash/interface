import { Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { useMostLiquidMarket } from "../../../hooks/useExternalExchange";
import { useLendgine } from "../../../hooks/useLendgine";
import { ONE_HUNDRED_PERCENT } from "../../../lib/constants";
import { borrowRate, supplyRate } from "../../../lib/liquidStakingJumprate";
import { priceToFraction } from "../../../lib/price";

export const useLongReturns = () => {
  const environment = useEnvironment();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const staking = environment.interface.liquidStaking!;

  const lendgineInfo = useLendgine(staking.lendgine);

  return useMemo(() => {
    const baseReturn = staking.return;
    const boostedReturn = baseReturn
      .multiply(2)
      .add(baseReturn.multiply(baseReturn));

    if (!lendgineInfo.data) return { baseReturn, boostedReturn };
    const funding = borrowRate(lendgineInfo.data);

    const totalAPR = boostedReturn.subtract(funding);
    return { baseReturn, boostedReturn, totalAPR, funding };
  }, [lendgineInfo.data, staking.return]);
};

export const useLPReturns = () => {
  const environment = useEnvironment();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const staking = environment.interface.liquidStaking!;

  const lendgineInfo = useLendgine(staking.lendgine);
  const priceQuery = useMostLiquidMarket({
    quote: staking.lendgine.token0,
    base: staking.lendgine.token1,
  });

  return useMemo(() => {
    if (!lendgineInfo.data || !priceQuery.data) return {};

    const cf = priceToFraction(staking.lendgine.bound)
      .multiply(priceToFraction(priceQuery.data.price))
      .multiply(2);

    const cs = priceToFraction(priceQuery.data.price).multiply(
      priceToFraction(priceQuery.data.price)
    );
    const currentValue = cf.subtract(cs);

    const ff = priceToFraction(staking.lendgine.bound)
      .multiply(priceToFraction(priceQuery.data.price))
      .multiply(2)
      .multiply(staking.return.add(ONE_HUNDRED_PERCENT));
    const fs = priceToFraction(priceQuery.data.price)
      .multiply(staking.return.add(ONE_HUNDRED_PERCENT))
      .multiply(
        priceToFraction(priceQuery.data.price).multiply(
          staking.return.add(ONE_HUNDRED_PERCENT)
        )
      );

    const futureValue = ff.subtract(fs);

    const fractionExpectedReturn = futureValue
      .subtract(currentValue)
      .divide(currentValue);

    const expectedReturns = new Percent(
      fractionExpectedReturn.numerator,
      fractionExpectedReturn.denominator
    );

    const sRate = supplyRate(lendgineInfo.data);

    const conversionCoeff = priceToFraction(priceQuery.data.price).multiply(
      priceToFraction(priceQuery.data.price).divide(currentValue)
    );

    const lendingReturns = sRate.multiply(conversionCoeff);

    const totalAPR = expectedReturns.add(lendingReturns);

    return { lendingReturns, expectedReturns, totalAPR };
  }, [
    lendgineInfo.data,
    priceQuery.data,
    staking.lendgine.bound,
    staking.return,
  ]);
};
