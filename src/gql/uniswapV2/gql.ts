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
    "query PriceV2($id: ID!) {\n  pair(id: $id) {\n    token0Price\n  }\n}\n\nquery PairV2($token0: String!, $token1: String!) {\n  pairs(where: {token0: $token0, token1: $token1}, subgraphError: allow) {\n    id\n    reserve0\n    token0Price\n  }\n}\n\nquery PriceHistoryHourV2($id: ID!, $amount: Int!) {\n  pair(id: $id, subgraphError: allow) {\n    hourData(orderDirection: desc, orderBy: date, first: $amount) {\n      date\n      reserve0\n      reserve1\n    }\n  }\n}\n\nquery PriceHistoryDayV2($id: ID!, $amount: Int!) {\n  pair(id: $id, subgraphError: allow) {\n    dayData(orderBy: date, orderDirection: desc, first: $amount) {\n      date\n      reserve0\n      reserve1\n    }\n  }\n}": types.PriceV2Document,
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
export function graphql(source: "query PriceV2($id: ID!) {\n  pair(id: $id) {\n    token0Price\n  }\n}\n\nquery PairV2($token0: String!, $token1: String!) {\n  pairs(where: {token0: $token0, token1: $token1}, subgraphError: allow) {\n    id\n    reserve0\n    token0Price\n  }\n}\n\nquery PriceHistoryHourV2($id: ID!, $amount: Int!) {\n  pair(id: $id, subgraphError: allow) {\n    hourData(orderDirection: desc, orderBy: date, first: $amount) {\n      date\n      reserve0\n      reserve1\n    }\n  }\n}\n\nquery PriceHistoryDayV2($id: ID!, $amount: Int!) {\n  pair(id: $id, subgraphError: allow) {\n    dayData(orderBy: date, orderDirection: desc, first: $amount) {\n      date\n      reserve0\n      reserve1\n    }\n  }\n}"): (typeof documents)["query PriceV2($id: ID!) {\n  pair(id: $id) {\n    token0Price\n  }\n}\n\nquery PairV2($token0: String!, $token1: String!) {\n  pairs(where: {token0: $token0, token1: $token1}, subgraphError: allow) {\n    id\n    reserve0\n    token0Price\n  }\n}\n\nquery PriceHistoryHourV2($id: ID!, $amount: Int!) {\n  pair(id: $id, subgraphError: allow) {\n    hourData(orderDirection: desc, orderBy: date, first: $amount) {\n      date\n      reserve0\n      reserve1\n    }\n  }\n}\n\nquery PriceHistoryDayV2($id: ID!, $amount: Int!) {\n  pair(id: $id, subgraphError: allow) {\n    dayData(orderBy: date, orderDirection: desc, first: $amount) {\n      date\n      reserve0\n      reserve1\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;