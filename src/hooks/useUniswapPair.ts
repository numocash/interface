import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { Fraction } from "@dahlia-labs/token-utils";
import { reservesMulticall } from "@dahlia-labs/uniswapv2-utils";
import { getAddress } from "@ethersproject/address";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import type { Address } from "wagmi";

import { Times } from "../components/pages/TradeDetails/TimeSelector";
import type { PriceV2Query } from "../gql/uniswapV2/graphql";
import type {
  LiquidResV2,
  PriceHistoryDayV2Res,
  PriceHistoryHourV2Res,
} from "../services/graphql/uniswapV2";
import {
  LiquidSearchV2,
  PriceHistoryDaySearchV2,
  PriceHistoryHourSearchV2,
  PriceSearchV2,
} from "../services/graphql/uniswapV2";
import type {
  MostLiquidResV3,
  PriceHistoryDayResV3,
  PriceHistoryHourResV3,
  PriceResV3,
} from "../services/graphql/uniswapV3";
import {
  MostLiquidSearchV3,
  PriceHistoryDaySearchV3,
  PriceHistoryHourSearchV3,
  PriceSearchV3,
} from "../services/graphql/uniswapV3";
import type { HookArg } from "./useApproval";
import { useBlockMulticall } from "./useBlockQuery";
import { useClient } from "./useClient";

type UniswapV2Pool = {
  token0: Token;
  token1: Token;
  address: Address;
};

type UniswapV3Pool = {
  token0: Token;
  token1: Token;
  address: Address;
  feeTier: "100" | "500" | "3000" | "10000";
};

const isV3 = (pool: UniswapV2Pool | UniswapV3Pool): pool is UniswapV3Pool =>
  "feeTier" in pool;

export const sortTokens = (
  tokens: readonly [Token, Token]
): readonly [Token, Token] =>
  tokens[0].address < tokens[1].address ? tokens : [tokens[1], tokens[0]];

// Returns data in base, speculative
export const useUniswapPair = (
  market: HookArg<IMarket>
): [TokenAmount, TokenAmount] | null => {
  const data = useBlockMulticall(
    market ? [reservesMulticall(market.referenceMarket)] : null
  );

  if (!data) return null;
  invariant(market);

  const baseFirst =
    market.pair.baseToken.address < market.pair.speculativeToken.address;

  return [
    baseFirst ? data[0][0] : data[0][1],
    baseFirst ? data[0][1] : data[0][0],
  ];
};

export const useMostLiquidMarket = (tokens: {
  denom: Token;
  other: Token;
}): UseQueryResult<UniswapV2Pool | UniswapV3Pool | null> => {
  const client = useClient();

  return useQuery<UniswapV2Pool | UniswapV3Pool | null>(
    ["query liquidity", tokens],
    async () => {
      const sortedTokens = sortTokens([tokens.denom, tokens.other]);

      const [v2, v3] = await Promise.all([
        client.sushiswap.request<LiquidResV2>(LiquidSearchV2, {
          token0: sortedTokens[0].address.toLowerCase(),
          token1: sortedTokens[1].address.toLowerCase(),
        }),
        client.uniswapv3.request<MostLiquidResV3>(MostLiquidSearchV3, {
          token0: sortedTokens[0].address.toLowerCase(),
          token1: sortedTokens[1].address.toLowerCase(),
        }),
      ] as const);

      if (!v2.pairs[0] && !v3.pools[0]) return null;

      if (!v3.pools[0]) {
        invariant(v2.pairs[0]);
        return {
          token0: sortedTokens[0],
          token1: sortedTokens[1],
          address: getAddress(v2.pairs[0].id),
        };
      }

      if (!v2.pairs[0]) {
        invariant(v3.pools[0]);
        return {
          token0: sortedTokens[0],
          token1: sortedTokens[1],
          address: getAddress(v3.pools[0].id),
        };
      }

      invariant(v2.pairs[0] && v3.pools[0]);

      return parseFloat(v2.pairs[0].reserve0) * 2 >
        parseFloat(v3.pools[0].totalValueLockedToken0)
        ? {
            token0: sortedTokens[0],
            token1: sortedTokens[1],
            address: getAddress(v2.pairs[0].id),
          }
        : {
            token0: sortedTokens[0],
            token1: sortedTokens[1],
            address: getAddress(v3.pools[0].id),
            feeTier: v3.pools[0].feeTier as UniswapV3Pool["feeTier"],
          };
    },
    {
      staleTime: Infinity,
    }
  );
};

// TODO: invert after the hook returns to increase speed

export type PricePoint = { timestamp: number; price: Fraction };

export const usePriceHistory = (
  externalExchange: HookArg<UniswapV2Pool | UniswapV3Pool>,
  timeframe: Times,
  invert: boolean
): UseQueryResult<PricePoint[] | null> => {
  const client = useClient();

  return useQuery<PricePoint[] | null>(
    ["price history", externalExchange, timeframe, invert],
    async () => {
      if (!externalExchange) return null;

      const priceHistory =
        timeframe === Times.ONE_DAY || timeframe === Times.ONE_WEEK
          ? isV3(externalExchange)
            ? await client.uniswapv3.request<PriceHistoryHourResV3>(
                PriceHistoryHourSearchV3,
                {
                  id: externalExchange.address.toLowerCase(),
                  amount: timeframe === Times.ONE_DAY ? 24 : 24 * 7,
                }
              )
            : await client.sushiswap.request<PriceHistoryHourV2Res>(
                PriceHistoryHourSearchV2,
                {
                  id: externalExchange.address.toLowerCase(),
                  amount: timeframe === Times.ONE_DAY ? 24 : 24 * 7,
                }
              )
          : isV3(externalExchange)
          ? await client.uniswapv3.request<PriceHistoryDayResV3>(
              PriceHistoryDaySearchV3,
              {
                id: externalExchange.address.toLowerCase(),
                amount: timeframe === Times.THREE_MONTH ? 92 : 365,
              }
            )
          : await client.sushiswap.request<PriceHistoryDayV2Res>(
              PriceHistoryDaySearchV2,
              {
                id: externalExchange.address.toLowerCase(),
                amount: timeframe === Times.THREE_MONTH ? 92 : 365,
              }
            );

      const isV2 = (
        t: typeof priceHistory
      ): t is PriceHistoryDayV2Res | PriceHistoryHourV2Res => {
        return "pair" in t;
      };

      const isHourV2 = (
        t: PriceHistoryHourV2Res | PriceHistoryDayV2Res
      ): t is PriceHistoryHourV2Res => "hourData" in t.pair;

      const isHourV3 = (
        t: PriceHistoryHourResV3 | PriceHistoryDayResV3
      ): t is PriceHistoryHourResV3 => "poolHourData" in t.pool;

      const parseV2 = (
        data: PriceHistoryHourV2Res["pair"]["hourData"][number]
      ): { timestamp: number; price: Fraction } => ({
        timestamp: +data.date,
        price: invert
          ? new Fraction(
              Math.floor(parseFloat(data.reserve1) * 10 ** 9),
              Math.floor(parseFloat(data.reserve0) * 10 ** 9)
            )
          : new Fraction(
              Math.floor(parseFloat(data.reserve0) * 10 ** 9),
              Math.floor(parseFloat(data.reserve1) * 10 ** 9)
            ),
      });

      const parseV3 = (
        data: Pick<
          PriceHistoryDayResV3["pool"]["poolDayData"][number],
          "token0Price"
        >
      ): { price: Fraction } => ({
        price: invert
          ? new Fraction(
              10 ** 9,
              Math.floor(parseFloat(data.token0Price) * 10 ** 9)
            )
          : new Fraction(
              Math.floor(parseFloat(data.token0Price) * 10 ** 9),
              10 ** 9
            ),
      });

      return isV2(priceHistory)
        ? isHourV2(priceHistory)
          ? priceHistory.pair.hourData.map((p) => parseV2(p))
          : priceHistory.pair.dayData.map((p) => parseV2(p))
        : isHourV3(priceHistory)
        ? priceHistory.pool.poolHourData.map((p) => ({
            timestamp: +p.periodStartUnix,
            ...parseV3(p),
          }))
        : priceHistory.pool.poolDayData.map((p) => ({
            timestamp: +p.date,
            ...parseV3(p),
          }));
    },
    {
      staleTime: Infinity,
    }
  );
};

export const useCurrentPrice = (
  externalExchange: HookArg<UniswapV2Pool | UniswapV3Pool>,
  invert: boolean
): UseQueryResult<Fraction | null> => {
  const client = useClient();
  return useQuery<Fraction | null>(
    ["current price", externalExchange, invert],
    async () => {
      if (!externalExchange) return null;

      const priceRes = isV3(externalExchange)
        ? await client.uniswapv3.request<PriceResV3>(PriceSearchV3, {
            id: externalExchange.address.toLowerCase(),
          })
        : await client.sushiswap.request(PriceSearchV2, {
            id: externalExchange.address.toLowerCase(),
          });

      const isV2 = (t: PriceV2Query | PriceResV3): t is PriceV2Query =>
        "pair" in t;

      // const destructToken0Price = isV2(priceRes)
      //   ? priceRes.pair?.token0Price
      //   : priceRes.pool.token0Price;

      return invert
        ? new Fraction(
            10 ** 9,
            Math.floor(parseFloat(destructToken0Price) * 10 ** 9)
          )
        : new Fraction(
            Math.floor(parseFloat(destructToken0Price) * 10 ** 9),
            10 ** 9
          );
    },
    {
      staleTime: Infinity,
    }
  );
};
