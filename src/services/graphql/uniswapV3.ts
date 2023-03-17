import { getAddress } from "@ethersproject/address";
import type { Token } from "@uniswap/sdk-core";
import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import type { Address } from "wagmi";

import type {
  MostLiquidV3Query,
  PriceHistoryDayV3Query,
  PriceHistoryHourV3Query,
} from "../../gql/uniswapV3/graphql";
import type { WrappedTokenInfo } from "../../lib/types/wrappedTokenInfo";
import type { PricePoint } from "./uniswapV2";

export const feeTiers = {
  100: "100",
  500: "500",
  3000: "3000",
  10000: "10000",
} as const;

export type UniswapV3Pool = {
  token0: Token;
  token1: Token;
  address: Address;
  feeTier: (typeof feeTiers)[keyof typeof feeTiers];
};

export const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
export const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2));

// TODO: is this sorting by how much token0 is locked or tvl in terms of token0
export const parseMostLiquidV3 = (
  mostLiquidV3Query: MostLiquidV3Query,
  tokens: readonly [WrappedTokenInfo, WrappedTokenInfo]
): {
  pool: UniswapV3Pool;
  totalLiquidity: number;
} | null =>
  mostLiquidV3Query.pools[0]
    ? {
        pool: {
          token0: tokens[0],
          token1: tokens[1],
          address: getAddress(mostLiquidV3Query.pools[0].id),
          feeTier: mostLiquidV3Query.pools[0]
            .feeTier as UniswapV3Pool["feeTier"],
        },
        totalLiquidity: parseFloat(
          mostLiquidV3Query.pools[0].totalValueLockedToken0
        ),
      }
    : null;

// returns null if the id used to query was not valid
export const parsePriceHistoryHourV3 = (
  priceHistoryHourV3Query: PriceHistoryHourV3Query
): readonly PricePoint[] | null =>
  priceHistoryHourV3Query.pool
    ? priceHistoryHourV3Query.pool.poolHourData.map((d) => ({
        timestamp: d.periodStartUnix,
        price: new Fraction(
          Math.floor(parseFloat(d.token0Price) * 10 ** 9),
          10 ** 9
        ),
      }))
    : null;

// returns null if the id used to query was not valid
export const parsePriceHistoryDayV3 = (
  priceHistoryDayV3Query: PriceHistoryDayV3Query
): readonly PricePoint[] | null =>
  priceHistoryDayV3Query.pool
    ? priceHistoryDayV3Query.pool.poolDayData.map((d) => ({
        timestamp: d.date,
        price: new Fraction(
          Math.floor(parseFloat(d.token0Price) * 10 ** 9),
          10 ** 9
        ),
      }))
    : null;
