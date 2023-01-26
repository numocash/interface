import { gql } from "graphql-request";

import { graphql } from "../../gql/uniswapV3";

export type MostLiquidResV3 = {
  pools:
    | readonly [{ id: string; feeTier: string; totalValueLockedToken0: string }]
    | [];
};

export const MostLiquidSearchV3 = gql`
  query MostLiquidV3($token0: String, $token1: String) {
    pools(
      where: { token0: $token0, token1: $token1 }
      orderBy: totalValueLockedToken0
      orderDirection: desc
      first: 1
    ) {
      id
      feeTier
      totalValueLockedToken0
    }
  }
`;

export type PriceHistoryHourResV3 = {
  pool: { poolHourData: { token0Price: string; periodStartUnix: string }[] };
};

export const PriceHistoryHourSearchV3 = gql`
  query PriceHistoryHourV3($id: ID!, $amount: Int) {
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

export type PriceHistoryDayResV3 = {
  pool: { poolDayData: { token0Price: string; date: string }[] };
};

export const PriceHistoryDaySearchV3 = gql`
  query PriceHistoryDayV3($id: ID!, $amount: Int) {
    pool(id: $id, subgraphError: allow) {
      poolDayData(orderBy: date, first: $amount, orderDirection: desc) {
        token0Price
        date
      }
    }
  }
`;

export type PriceResV3 = {
  pool: {
    token0Price: string;
  };
};

export const PriceSearchV3 = graphql(`
  query PriceV3($id: ID!) {
    pool(id: $id, subgraphError: allow) {
      token0Price
    }
  }
`);
