import type { TokenAmount } from "@dahlia-labs/token-utils";
import { Percent, Price } from "@dahlia-labs/token-utils";
import { useMemo } from "react";

import type {
  IMarket,
  IMarketInfo,
  IPair,
  IPairInfo,
} from "../../../../contexts/environment";
import { useLendgine } from "../../../../hooks/useLendgine";
import { usePair } from "../../../../hooks/usePair";
import { RowBetween } from "../../../common/RowBetween";

interface Props {
  market: IMarket;
}

const pairInfoToPrice = (pairInfo: IPairInfo, pair: IPair): Price => {
  if (pairInfo.totalLPSupply.equalTo(0))
    return new Price(pair.speculativeToken, pair.baseToken, 1, 0);

  const scale1 = pairInfo.speculativeAmount.divide(pairInfo.totalLPSupply);
  const priceFraction = pair.bound.subtract(scale1.divide(2));
  return new Price(
    pair.speculativeToken,
    pair.baseToken,
    priceFraction.denominator,
    priceFraction.numerator
  );
};

const pricePerLP = (pairInfo: IPairInfo, pair: IPair): Price => {
  const price = pairInfoToPrice(pairInfo, pair);
  if (price.equalTo(0)) return new Price(pair.lp, pair.baseToken, 1, 0);
  const scale0 = pairInfo.baseAmount.divide(pairInfo.totalLPSupply);
  const scale1 = pairInfo.speculativeAmount.divide(pairInfo.totalLPSupply);
  const priceFraction = scale0.add(scale1.multiply(price));

  return new Price(
    pair.lp,
    pair.baseToken,
    priceFraction.denominator,
    priceFraction.numerator
  );
};

const totalValue = (
  marketInfo: IMarketInfo,
  pairInfo: IPairInfo,
  market: IMarket
): TokenAmount => {
  const price = pricePerLP(pairInfo, market.pair);
  return price.quote(marketInfo.totalLiquidity);
};

const kink = new Percent(8, 10);
const multiplier = new Percent(1375, 100000);
const jumpMultiplier = new Percent(89, 200);

const borrowRate = (marketInfo: IMarketInfo): Percent => {
  if (marketInfo.totalLiquidity.equalTo(0)) return new Percent(0);
  const utilization = Percent.fromFraction(
    marketInfo.totalLiquidityBorrowed.divide(marketInfo.totalLiquidity)
  );

  if (utilization.greaterThan(kink)) {
    const normalRate = kink.multiply(multiplier);
    const excessUtil = utilization.subtract(kink);
    return excessUtil.multiply(jumpMultiplier).add(normalRate);
  } else {
    return utilization.multiply(multiplier);
  }
};

const supplyRate = (marketInfo: IMarketInfo): Percent => {
  if (marketInfo.totalLiquidity.equalTo(0)) return new Percent(0);
  const utilization = Percent.fromFraction(
    marketInfo.totalLiquidityBorrowed.divide(marketInfo.totalLiquidity)
  );

  const borrow = borrowRate(marketInfo);
  return utilization.multiply(borrow);
};

export const Stats: React.FC<Props> = ({ market }: Props) => {
  const marketInfo = useLendgine(market);
  const pairInfo = usePair(market.pair);
  const tvl = useMemo(
    () =>
      marketInfo && pairInfo ? totalValue(marketInfo, pairInfo, market) : null,
    [market, marketInfo, pairInfo]
  );

  const rate = useMemo(
    () => (marketInfo ? supplyRate(marketInfo) : null),
    [marketInfo]
  );

  return (
    <div tw="">
      <RowBetween tw="">
        <p tw="text-default">APR</p>
        <p tw="text-default font-semibold">{rate ? rate.toFixed(1) : "--"}%</p>
      </RowBetween>
      <hr tw="border-[#AEAEB2] rounded " />
      <RowBetween>
        <p tw="text-default">TVL</p>
        <p tw="text-default font-semibold">
          {tvl ? tvl.toFixed(2, { groupSeparator: "," }) : "--"}{" "}
          {market.pair.baseToken.symbol.toString()}
        </p>
      </RowBetween>
    </div>
  );
};
