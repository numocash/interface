/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\n  query MostLiquidV3($token0: String, $token1: String) {\n    pools(\n      where: { token0: $token0, token1: $token1 }\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      first: 1\n    ) {\n      id\n      feeTier\n      totalValueLockedToken0\n    }\n  }\n": types.MostLiquidV3Document,
    "\n  query PriceHistoryHourV3($id: ID!, $amount: Int) {\n    pool(id: $id, subgraphError: allow) {\n      poolHourData(\n        orderBy: periodStartUnix\n        first: $amount\n        orderDirection: desc\n      ) {\n        token0Price\n        periodStartUnix\n      }\n    }\n  }\n": types.PriceHistoryHourV3Document,
    "\n  query PriceHistoryDayV3($id: ID!, $amount: Int) {\n    pool(id: $id, subgraphError: allow) {\n      poolDayData(orderBy: date, first: $amount, orderDirection: desc) {\n        token0Price\n        date\n      }\n    }\n  }\n": types.PriceHistoryDayV3Document,
    "\n  query PriceV3($id: ID!) {\n    pool(id: $id, subgraphError: allow) {\n      token0Price\n    }\n  }\n": types.PriceV3Document,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MostLiquidV3($token0: String, $token1: String) {\n    pools(\n      where: { token0: $token0, token1: $token1 }\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      first: 1\n    ) {\n      id\n      feeTier\n      totalValueLockedToken0\n    }\n  }\n"): (typeof documents)["\n  query MostLiquidV3($token0: String, $token1: String) {\n    pools(\n      where: { token0: $token0, token1: $token1 }\n      orderBy: totalValueLockedToken0\n      orderDirection: desc\n      first: 1\n    ) {\n      id\n      feeTier\n      totalValueLockedToken0\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PriceHistoryHourV3($id: ID!, $amount: Int) {\n    pool(id: $id, subgraphError: allow) {\n      poolHourData(\n        orderBy: periodStartUnix\n        first: $amount\n        orderDirection: desc\n      ) {\n        token0Price\n        periodStartUnix\n      }\n    }\n  }\n"): (typeof documents)["\n  query PriceHistoryHourV3($id: ID!, $amount: Int) {\n    pool(id: $id, subgraphError: allow) {\n      poolHourData(\n        orderBy: periodStartUnix\n        first: $amount\n        orderDirection: desc\n      ) {\n        token0Price\n        periodStartUnix\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PriceHistoryDayV3($id: ID!, $amount: Int) {\n    pool(id: $id, subgraphError: allow) {\n      poolDayData(orderBy: date, first: $amount, orderDirection: desc) {\n        token0Price\n        date\n      }\n    }\n  }\n"): (typeof documents)["\n  query PriceHistoryDayV3($id: ID!, $amount: Int) {\n    pool(id: $id, subgraphError: allow) {\n      poolDayData(orderBy: date, first: $amount, orderDirection: desc) {\n        token0Price\n        date\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PriceV3($id: ID!) {\n    pool(id: $id, subgraphError: allow) {\n      token0Price\n    }\n  }\n"): (typeof documents)["\n  query PriceV3($id: ID!) {\n    pool(id: $id, subgraphError: allow) {\n      token0Price\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;