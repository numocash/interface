import type { Token } from "@uniswap/sdk-core";
import { Fraction, Price } from "@uniswap/sdk-core";
import JSBI from "jsbi";

import type { Lendgine, LendgineInfo } from "../../constants/types";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";
import { liquidityPerCollateral } from "./lendgineMath";

// returns price in token0 / token1
export const numoenPrice = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  if (lendgineInfo.totalLiquidity.equalTo(0))
    return new Price(lendgine.token1, lendgine.token0, 1, 0);

  const scale1 = lendgineInfo.reserve1.asFraction.divide(
    lendgineInfo.totalLiquidity
  );

  const priceFraction = priceToFraction(lendgine.bound).subtract(
    scale1.asFraction.divide(2)
  );

  return fractionToPrice(priceFraction, lendgine.token1, lendgine.token0);
};

// The value of one nondiluted share of collateral in terms of token0
export const pricePerCollateral = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const price = numoenPrice(lendgine, lendgineInfo);

  return liquidityPerCollateral(lendgine).invert().multiply(price);
};

// The value of one nondiluted share of liquidity in terms of token0
export const pricePerLiquidity = <L extends Lendgine>(
  args: (
    | { lendgineInfo: LendgineInfo<L> }
    | { price: Price<L["token1"], L["token0"]> }
  ) & { lendgine: L }
) => {
  const price = priceToFraction(
    "lendgineInfo" in args
      ? numoenPrice(args.lendgine, args.lendgineInfo)
      : args.price
  );

  const f = priceToFraction(args.lendgine.bound)
    .multiply(price)
    .multiply(2)
    .subtract(price.multiply(price));

  return fractionToPrice(f, args.lendgine.lendgine, args.lendgine.token0);
};

// The value of one nondiluted share in terms of token0
export const pricePerShare = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const f = pricePerCollateral(lendgine, lendgineInfo).subtract(
    pricePerLiquidity({ lendgine, lendgineInfo })
  );
  return fractionToPrice(f, lendgine.lendgine, lendgine.token0);
};

export const lvrCoef = (
  price: Price<WrappedTokenInfo, WrappedTokenInfo>,
  lendgine: Lendgine
) => {
  if (price.greaterThan(lendgine.bound)) return new Fraction(0);
  const numerator = priceToFraction(price).multiply(priceToFraction(price));
  const denominator = priceToFraction(price)
    .multiply(priceToFraction(lendgine.bound))
    .multiply(2)
    .subtract(numerator);
  return numerator.divide(denominator);
};

export const nextHighestLendgine = <L extends Lendgine>(
  props: (
    | {
        price: Price<WrappedTokenInfo, WrappedTokenInfo>;
      }
    | {
        lendgine: L;
      }
  ) & {
    lendgines: Lendgine[];
  }
) => {
  const sortedLendgines = props.lendgines.sort((a, b) =>
    a.bound.greaterThan(b.bound) ? 1 : -1
  );

  const price = "price" in props ? props.price : props.lendgine.bound;
  console.log("yw", price.toSignificant(5));

  return sortedLendgines.reduce(
    (acc: Lendgine | null, cur) =>
      acc === null && cur.bound.greaterThan(price) ? cur : acc,
    null
  );
};

export const nextLowestLendgine = <L extends Lendgine>(
  props: (
    | {
        price: Price<WrappedTokenInfo, WrappedTokenInfo>;
      }
    | {
        lendgine: L;
      }
  ) & {
    lendgines: Lendgine[];
  }
) => {
  const sortedLendgines = props.lendgines.sort((a, b) =>
    a.bound.greaterThan(b.bound) ? 1 : -1
  );

  const price = "lendgine" in props ? props.lendgine.bound : props.price;

  return sortedLendgines.reduce(
    (acc: Lendgine | null, cur) =>
      acc === null && cur.bound.lessThan(price) ? cur : acc,
    null
  );
};

export const priceToReserves = <L extends Lendgine>(
  lendgine: L,
  price: Price<L["token1"], L["token0"]>
): {
  token0Amount: Price<L["lendgine"], L["token0"]>;
  token1Amount: Price<L["lendgine"], L["token1"]>;
} => {
  const token0AmountFraction = priceToFraction(price).multiply(
    priceToFraction(price)
  );
  const token0Amount = fractionToPrice(
    token0AmountFraction,
    lendgine.lendgine,
    lendgine.token0
  );

  const token1AmountFraction = priceToFraction(lendgine.bound)
    .subtract(priceToFraction(price))
    .multiply(2);
  const token1Amount = fractionToPrice(
    token1AmountFraction,
    lendgine.lendgine,
    lendgine.token1
  );

  return { token0Amount, token1Amount };
};

export const fractionToPrice = <TBase extends Token, TQuote extends Token>(
  price: Fraction,
  base: TBase,
  quote: TQuote
) => {
  return new Price(
    base,
    quote,
    JSBI.multiply(
      price.denominator,
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(base.decimals))
    ),
    JSBI.multiply(
      price.numerator,
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(quote.decimals))
    )
  );
};

export const priceToFraction = <TBase extends Token, TQuote extends Token>(
  price: Price<TBase, TQuote>
) => {
  return price.asFraction
    .multiply(
      JSBI.exponentiate(
        JSBI.BigInt(10),
        JSBI.BigInt(price.baseCurrency.decimals)
      )
    )
    .divide(
      JSBI.exponentiate(
        JSBI.BigInt(10),
        JSBI.BigInt(price.quoteCurrency.decimals)
      )
    );
};

export const invert = <TBase extends Token, TQuote extends Token>(
  price: Price<TBase, TQuote>
) => {
  if (price.equalTo(0))
    return new Price(price.quoteCurrency, price.baseCurrency, 1, 0);
  return price.invert();
};
