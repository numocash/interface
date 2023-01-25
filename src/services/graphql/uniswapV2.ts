import { gql } from "graphql-request";

export type PriceResV2 = {
  pair: {
    token0Price: string;
  };
};

export const PriceSearchV2 = gql`
  query PriceV2($id: ID!) {
    pair(id: $id, subgraphError: allow) {
      token0Price
    }
  }
`;

export type LiquidResV2 = {
  pairs: readonly [{ id: string; reserve0: string }] | [];
};

export const LiquidSearchV2 = gql`
  query PairV2($token0: String!, $token1: String!) {
    pairs(where: { token0: $token0, token1: $token1 }, subgraphError: allow) {
      id
      reserve0
    }
  }
`;

export type PriceHistoryHourV2Res = {
  pair: { hourData: { date: string; reserve0: string; reserve1: string }[] };
};

export const PriceHistoryHourSearchV2 = gql`
  query PriceHistoryHourV2($id: ID!, $amount: Int!) {
    pair(id: $id, subgraphError: allow) {
      hourData(orderDirection: desc, orderBy: date, first: $amount) {
        date
        reserve0
        reserve1
      }
    }
  }
`;

export type PriceHistoryDayV2Res = {
  pair: { dayData: { date: string; reserve0: string; reserve1: string }[] };
};

export const PriceHistoryDaySearchV2 = gql`
  query PriceHistoryDayV2($id: ID!, $amount: Int!) {
    pair(id: $id, subgraphError: allow) {
      dayData(orderBy: date, orderDirection: desc, first: $amount) {
        date
        reserve0
        reserve1
      }
    }
  }
`;
