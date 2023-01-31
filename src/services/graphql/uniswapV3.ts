import { getAddress } from "@ethersproject/address";
import type { Fraction, Token } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

import type {
  MostLiquidV3Query,
  PriceHistoryDayV3Query,
  PriceHistoryHourV3Query,
  PriceV3Query,
} from "../../gql/uniswapV3/graphql";
import type { PricePoint } from "./uniswapV2";
import { parsePriceHelper } from "./uniswapV2";

export type UniswapV3Pool = {
  token0: Token;
  token1: Token;
  address: Address;
  feeTier: "100" | "500" | "3000" | "10000";
};

// returns null if the id used to query was not valid
export const parsePriceV3 = (priceV3Query: PriceV3Query): Fraction | null =>
  priceV3Query.pool
    ? parsePriceHelper(parseFloat(priceV3Query.pool.token0Price))
    : null;

// TODO: is this sorting by how much token0 is locked or tvl in terms of token0
export const parseMostLiquidV3 = (
  mostLiquidV3Query: MostLiquidV3Query,
  tokens: readonly [Token, Token]
): { pool: UniswapV3Pool; totalLiquidity: number } | null =>
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
        price: parsePriceHelper(parseFloat(d.token0Price)),
      }))
    : null;

// returns null if the id used to query was not valid
export const parsePriceHistoryDayV3 = (
  priceHistoryDayV3Query: PriceHistoryDayV3Query
): readonly PricePoint[] | null =>
  priceHistoryDayV3Query.pool
    ? priceHistoryDayV3Query.pool.poolDayData.map((d) => ({
        timestamp: d.date,
        price: parsePriceHelper(parseFloat(d.token0Price)),
      }))
    : null;
