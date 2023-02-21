import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { Fraction, Token } from "@uniswap/sdk-core";
import invariant from "tiny-invariant";

import { Times } from "../components/pages/TradeDetails/Chart/TimeSelector";
import type {
  PriceHistoryDayV2Query,
  PriceHistoryHourV2Query,
} from "../gql/uniswapV2/graphql";
import {
  PairV2Document,
  PriceHistoryDayV2Document,
  PriceHistoryHourV2Document,
} from "../gql/uniswapV2/graphql";
import type {
  PriceHistoryDayV3Query,
  PriceHistoryHourV3Query,
} from "../gql/uniswapV3/graphql";
import {
  MostLiquidV3Document,
  PriceHistoryDayV3Document,
  PriceHistoryHourV3Document,
} from "../gql/uniswapV3/graphql";
import type { PricePoint, UniswapV2Pool } from "../services/graphql/uniswapV2";
import {
  parsePairV2,
  parsePriceHistoryDayV2,
  parsePriceHistoryHourV2,
} from "../services/graphql/uniswapV2";
import type { UniswapV3Pool } from "../services/graphql/uniswapV3";
import {
  parseMostLiquidV3,
  parsePriceHistoryDayV3,
  parsePriceHistoryHourV3,
} from "../services/graphql/uniswapV3";
import type { HookArg } from "./useBalance";
import { useClient } from "./useClient";

const isV3 = (t: UniswapV2Pool | UniswapV3Pool): t is UniswapV3Pool =>
  "feeTier" in t;

export const useMostLiquidMarket = (
  tokens: readonly [HookArg<Token>, HookArg<Token>]
) => {
  const client = useClient();
  const sortedTokens =
    tokens[0] && tokens[1]
      ? tokens[0].sortsBefore(tokens[1])
        ? ([tokens[0], tokens[1]] as const)
        : ([tokens[1], tokens[0]] as const)
      : null;

  return useQuery<{
    pool: UniswapV2Pool | UniswapV3Pool;
    price: Fraction;
  } | null>(
    ["query liquidity", sortedTokens],
    async () => {
      if (!sortedTokens) return null;

      const variables = {
        token0: sortedTokens[0].address.toLowerCase(),
        token1: sortedTokens[1].address.toLowerCase(),
      };

      const [v2, v3] = await Promise.all([
        client.uniswapV2.request(PairV2Document, variables),
        client.uniswapV3.request(MostLiquidV3Document, variables),
      ] as const);

      const v2data = parsePairV2(v2, sortedTokens);
      const v3data = parseMostLiquidV3(v3, sortedTokens);

      if (!v2data && !v3data) return null;

      if (!v3data) {
        invariant(v2data);
        return { pool: v2data.pool, price: v2data.price };
      }

      if (!v2data) {
        invariant(v3data);
        return { pool: v3data.pool, price: v3data.price };
      }

      return {
        pool:
          v2data.totalLiquidity > v3data.totalLiquidity
            ? v2data.pool
            : v3data.pool,
        price:
          v2data.totalLiquidity > v3data.totalLiquidity
            ? v2data.price
            : v3data.price,
      };
    },
    {
      staleTime: Infinity,
    }
  );
};

export const usePriceHistory = (
  externalExchange: HookArg<UniswapV2Pool | UniswapV3Pool>,
  timeframe: Times
): UseQueryResult<readonly PricePoint[] | null> => {
  const client = useClient();

  return useQuery<readonly PricePoint[] | null>(
    ["price history", externalExchange, timeframe],
    async () => {
      if (!externalExchange) return null;

      const variables = {
        id: externalExchange.address.toLowerCase(),
        amount:
          timeframe === Times.ONE_DAY
            ? 24
            : timeframe === Times.ONE_WEEK
            ? 24 * 7
            : timeframe === Times.THREE_MONTH
            ? 92
            : 365,
      };

      const priceHistory =
        timeframe === Times.ONE_DAY || timeframe === Times.ONE_WEEK
          ? isV3(externalExchange)
            ? await client.uniswapV3.request(
                PriceHistoryHourV3Document,
                variables
              )
            : await client.uniswapV2.request(
                PriceHistoryHourV2Document,
                variables
              )
          : isV3(externalExchange)
          ? await client.uniswapV3.request(PriceHistoryDayV3Document, variables)
          : await client.uniswapV2.request(
              PriceHistoryDayV2Document,
              variables
            );

      const isV2 = (
        t: typeof priceHistory
      ): t is PriceHistoryHourV2Query | PriceHistoryDayV2Query => {
        return "pair" in t;
      };

      const isHourV2 = (
        t: PriceHistoryHourV2Query | PriceHistoryDayV2Query
      ): t is PriceHistoryHourV2Query =>
        t.pair ? "hourData" in t.pair : false;

      const isHourV3 = (
        t: PriceHistoryHourV3Query | PriceHistoryDayV3Query
      ): t is PriceHistoryHourV3Query =>
        t.pool ? "poolHourData" in t.pool : false;

      return isV2(priceHistory)
        ? priceHistory.pair
          ? isHourV2(priceHistory)
            ? parsePriceHistoryHourV2(priceHistory)
            : parsePriceHistoryDayV2(priceHistory)
          : null
        : priceHistory.pool
        ? isHourV3(priceHistory)
          ? parsePriceHistoryHourV3(priceHistory)
          : parsePriceHistoryDayV3(priceHistory)
        : null;
    },
    {
      staleTime: Infinity,
    }
  );
};
