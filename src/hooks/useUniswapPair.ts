import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { Fraction } from "@dahlia-labs/token-utils";
import { reservesMulticall } from "@dahlia-labs/uniswapv2-utils";
import { getAddress } from "@ethersproject/address";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import invariant from "tiny-invariant";
import type { Address } from "wagmi";

import { Times } from "../components/pages/TradeDetails/TimeSelector";
import type { HookArg } from "./useApproval";
import { useBlockMulticall } from "./useBlockQuery";
import { useClient } from "./useClient";

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

type MostLiquidResV3 = {
  pools: readonly [{ id: string; feeTier: string }] | [];
};

const MOST_LIQUID_RES_SEARCH_V3 = gql`
  query MostLiquidV3($token0: Bytes!, $token1: Bytes!) {
    pools(
      where: { token0: $token0, token1: $token1 }
      orderBy: totalValueLockedToken0
      orderDirection: desc
      first: 1
    ) {
      id
      feeTier
    }
  }
`;

type UniswapV3Pool = {
  token0: Token;
  token1: Token;
  address: Address;
  feeTier: "100" | "500" | "3000" | "10000";
};

export const useMostLiquidMarket = (tokens: {
  denom: Token;
  other: Token;
}): UseQueryResult<UniswapV3Pool | null> => {
  // TODO: query uniswapV2 TVL
  const client = useClient();

  return useQuery(["query liquidity", tokens], async () => {
    const sortedTokens = sortTokens([tokens.denom, tokens.other]);
    const mostLiquidPool = (
      await client.request<MostLiquidResV3>(MOST_LIQUID_RES_SEARCH_V3, {
        token0: sortedTokens[0].address.toLowerCase(),
        token1: sortedTokens[1].address.toLowerCase(),
      })
    ).pools;

    if (mostLiquidPool.length === 0) return null;
    return {
      token0: sortedTokens[0],
      token1: sortedTokens[1],
      address: getAddress(mostLiquidPool[0].id),
      feeTier: mostLiquidPool[0].feeTier as UniswapV3Pool["feeTier"],
    };
  });
};

// export const useMostLiquidMarketBatch = (
//   markets: { denom: Token; other: Token }[]
// ): UseQueryResult<(UniswapV3Pool | null)[]> => {
//   const client = useClient();
//   return useQuery(["most liquid batch", markets], async () => {
//     const requests = markets.map((m) => {
//       const sortedTokens = sortTokens([m.denom, m.other]);
//       return {
//         document: MOST_LIQUID_RES_SEARCH_V3,
//         variables: {
//           token0: sortedTokens[0].address.toLowerCase(),
//           token1: sortedTokens[1].address.toLowerCase(),
//         },
//       };
//     });

//     const data = await client.batchRequests<MostLiquidResV3>(requests);

//     console.log(data);

//     return null;
//   });
// };

type PriceHistoryResV3 = {
  pool: { poolHourData: { token0Price: string; periodStartUnix: string }[] };
};

const PriceHistorySearchV3 = gql`
  query PriceHistoryV3($id: String, $amount: Int) {
    pool(id: $id, subgraphError: allow) {
      poolHourData(
        orderBy: periodStartUnix
        first: $amount
        orderDirection: desc
      ) {
        token0Price
        periodStartUnix
      }
    }
  }
`;

export const usePriceHistory = (
  externalExchange: HookArg<UniswapV3Pool>,
  timeframe: Times,
  invert: boolean
): UseQueryResult<
  | {
      timestamp: number;
      price: Fraction;
    }[]
  | null
> => {
  const client = useClient();

  // TODO: return type isn't being strictly typechecked
  return useQuery(["price history", externalExchange, timeframe], async () => {
    if (!externalExchange) return null;

    const priceHistory =
      timeframe === Times.ONE_DAY || timeframe === Times.ONE_WEEK
        ? await client.request<PriceHistoryResV3>(PriceHistorySearchV3, {
            id: externalExchange.address.toLowerCase(),
            amount: timeframe === Times.ONE_DAY ? 24 : 24 * 7,
          })
        : null;

    return priceHistory
      ? priceHistory.pool.poolHourData.map((p) => ({
          timestamp: +p.periodStartUnix,
          price: invert
            ? new Fraction(
                10 ** 9,
                Math.floor(parseFloat(p.token0Price) * 10 ** 9)
              )
            : new Fraction(
                Math.floor(parseFloat(p.token0Price) * 10 ** 9),
                10 ** 9
              ),
        }))
      : null;
  });
};

type PriceResV3 = {
  pool: {
    token0Price: string;
  };
};

const PriceSearchV3 = gql`
  query PriceV3($id: String) {
    pool(id: $id, subgraphError: allow) {
      token0Price
    }
  }
`;

export const useCurrentPrice = (
  externalExchange: HookArg<UniswapV3Pool>,
  invert: boolean
): UseQueryResult<Fraction | null> => {
  const client = useClient();
  return useQuery(["current price", externalExchange], async () => {
    if (!externalExchange) return null;

    const priceRes = await client.request<PriceResV3>(PriceSearchV3, {
      id: externalExchange.address.toLowerCase(),
    });

    return invert
      ? new Fraction(
          10 ** 9,
          Math.floor(parseFloat(priceRes.pool.token0Price) * 10 ** 9)
        )
      : new Fraction(
          Math.floor(parseFloat(priceRes.pool.token0Price) * 10 ** 9),
          10 ** 9
        );
  });
};
