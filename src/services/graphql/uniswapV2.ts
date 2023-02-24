import { getAddress } from "@ethersproject/address";
import type { Price, Token } from "@uniswap/sdk-core";
import { Fraction } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

import type {
  PairV2Query,
  PriceHistoryDayV2Query,
  PriceHistoryHourV2Query,
} from "../../gql/uniswapV2/graphql";
import type { WrappedTokenInfo } from "../../hooks/useTokens2";
import { fractionToPrice } from "../../utils/Numoen/price";

export type UniswapV2Pool = {
  token0: Token;
  token1: Token;
  address: Address;
};

export type PricePoint = { timestamp: number; price: Fraction };

export const parsePriceHelper = (price: number) =>
  new Fraction(Math.floor(price * 10 ** 9), 10 ** 9);

export const parsePairV2 = (
  pairV2Query: PairV2Query,
  tokens: readonly [WrappedTokenInfo, WrappedTokenInfo]
): {
  pool: UniswapV2Pool;
  totalLiquidity: number;
  price: Price<WrappedTokenInfo, WrappedTokenInfo>;
} | null =>
  pairV2Query.pairs[0]
    ? {
        pool: {
          token0: tokens[0],
          token1: tokens[1],
          address: getAddress(pairV2Query.pairs[0].id),
        },
        totalLiquidity: parseFloat(pairV2Query.pairs[0].reserve0) * 2,
        price: fractionToPrice(
          parsePriceHelper(parseFloat(pairV2Query.pairs[0].token0Price)),
          tokens[1],
          tokens[0]
        ),
      }
    : null;

// returns null if the id used to query was not valid
export const parsePriceHistoryHourV2 = (
  priceHistoryHourV2Query: PriceHistoryHourV2Query
): readonly PricePoint[] | null =>
  priceHistoryHourV2Query.pair
    ? priceHistoryHourV2Query.pair.hourData.map((d) => ({
        timestamp: d.date,
        price: new Fraction(
          Math.floor(parseFloat(d.reserve0) * 10 ** 9),
          Math.floor(parseFloat(d.reserve1) * 10 ** 9)
        ),
      }))
    : null;

export const parsePriceHistoryDayV2 = (
  priceHistoryDayV2Query: PriceHistoryDayV2Query
): readonly PricePoint[] | null =>
  priceHistoryDayV2Query.pair
    ? priceHistoryDayV2Query.pair.dayData.map((d) => ({
        timestamp: d.date,
        price: new Fraction(
          Math.floor(parseFloat(d.reserve0) * 10 ** 9),
          Math.floor(parseFloat(d.reserve1) * 10 ** 9)
        ),
      }))
    : null;
