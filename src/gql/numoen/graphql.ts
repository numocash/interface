/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: string;
  BigInt: string;
  Bytes: string;
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash: InputMaybe<Scalars['Bytes']>;
  number: InputMaybe<Scalars['Int']>;
  number_gte: InputMaybe<Scalars['Int']>;
};

export type Factory = {
  __typename?: 'Factory';
  /** factory address */
  id: Scalars['ID'];
  /** amount of lendgines created */
  lendgineCount: Scalars['BigInt'];
};

export type Factory_Filter = {
  /** Filter for the block changed event. */
  _change_block: InputMaybe<BlockChangedFilter>;
  id: InputMaybe<Scalars['ID']>;
  id_gt: InputMaybe<Scalars['ID']>;
  id_gte: InputMaybe<Scalars['ID']>;
  id_in: InputMaybe<Array<Scalars['ID']>>;
  id_lt: InputMaybe<Scalars['ID']>;
  id_lte: InputMaybe<Scalars['ID']>;
  id_not: InputMaybe<Scalars['ID']>;
  id_not_in: InputMaybe<Array<Scalars['ID']>>;
  lendgineCount: InputMaybe<Scalars['BigInt']>;
  lendgineCount_gt: InputMaybe<Scalars['BigInt']>;
  lendgineCount_gte: InputMaybe<Scalars['BigInt']>;
  lendgineCount_in: InputMaybe<Array<Scalars['BigInt']>>;
  lendgineCount_lt: InputMaybe<Scalars['BigInt']>;
  lendgineCount_lte: InputMaybe<Scalars['BigInt']>;
  lendgineCount_not: InputMaybe<Scalars['BigInt']>;
  lendgineCount_not_in: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Factory_OrderBy {
  Id = 'id',
  LendgineCount = 'lendgineCount'
}

export type Lendgine = {
  __typename?: 'Lendgine';
  /** Address */
  id: Scalars['ID'];
  /** immutables */
  token0: Scalars['Bytes'];
  token0Exp: Scalars['Int'];
  token1: Scalars['Bytes'];
  token1Exp: Scalars['Int'];
  upperBound: Scalars['BigInt'];
};

export type Lendgine_Filter = {
  /** Filter for the block changed event. */
  _change_block: InputMaybe<BlockChangedFilter>;
  id: InputMaybe<Scalars['ID']>;
  id_gt: InputMaybe<Scalars['ID']>;
  id_gte: InputMaybe<Scalars['ID']>;
  id_in: InputMaybe<Array<Scalars['ID']>>;
  id_lt: InputMaybe<Scalars['ID']>;
  id_lte: InputMaybe<Scalars['ID']>;
  id_not: InputMaybe<Scalars['ID']>;
  id_not_in: InputMaybe<Array<Scalars['ID']>>;
  token0: InputMaybe<Scalars['Bytes']>;
  token0Exp: InputMaybe<Scalars['Int']>;
  token0Exp_gt: InputMaybe<Scalars['Int']>;
  token0Exp_gte: InputMaybe<Scalars['Int']>;
  token0Exp_in: InputMaybe<Array<Scalars['Int']>>;
  token0Exp_lt: InputMaybe<Scalars['Int']>;
  token0Exp_lte: InputMaybe<Scalars['Int']>;
  token0Exp_not: InputMaybe<Scalars['Int']>;
  token0Exp_not_in: InputMaybe<Array<Scalars['Int']>>;
  token0_contains: InputMaybe<Scalars['Bytes']>;
  token0_in: InputMaybe<Array<Scalars['Bytes']>>;
  token0_not: InputMaybe<Scalars['Bytes']>;
  token0_not_contains: InputMaybe<Scalars['Bytes']>;
  token0_not_in: InputMaybe<Array<Scalars['Bytes']>>;
  token1: InputMaybe<Scalars['Bytes']>;
  token1Exp: InputMaybe<Scalars['Int']>;
  token1Exp_gt: InputMaybe<Scalars['Int']>;
  token1Exp_gte: InputMaybe<Scalars['Int']>;
  token1Exp_in: InputMaybe<Array<Scalars['Int']>>;
  token1Exp_lt: InputMaybe<Scalars['Int']>;
  token1Exp_lte: InputMaybe<Scalars['Int']>;
  token1Exp_not: InputMaybe<Scalars['Int']>;
  token1Exp_not_in: InputMaybe<Array<Scalars['Int']>>;
  token1_contains: InputMaybe<Scalars['Bytes']>;
  token1_in: InputMaybe<Array<Scalars['Bytes']>>;
  token1_not: InputMaybe<Scalars['Bytes']>;
  token1_not_contains: InputMaybe<Scalars['Bytes']>;
  token1_not_in: InputMaybe<Array<Scalars['Bytes']>>;
  upperBound: InputMaybe<Scalars['BigInt']>;
  upperBound_gt: InputMaybe<Scalars['BigInt']>;
  upperBound_gte: InputMaybe<Scalars['BigInt']>;
  upperBound_in: InputMaybe<Array<Scalars['BigInt']>>;
  upperBound_lt: InputMaybe<Scalars['BigInt']>;
  upperBound_lte: InputMaybe<Scalars['BigInt']>;
  upperBound_not: InputMaybe<Scalars['BigInt']>;
  upperBound_not_in: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Lendgine_OrderBy {
  Id = 'id',
  Token0 = 'token0',
  Token0Exp = 'token0Exp',
  Token1 = 'token1',
  Token1Exp = 'token1Exp',
  UpperBound = 'upperBound'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta: Maybe<_Meta_>;
  factories: Array<Factory>;
  factory: Maybe<Factory>;
  lendgine: Maybe<Lendgine>;
  lendgines: Array<Lendgine>;
};


export type Query_MetaArgs = {
  block: InputMaybe<Block_Height>;
};


export type QueryFactoriesArgs = {
  block: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy: InputMaybe<Factory_OrderBy>;
  orderDirection: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where: InputMaybe<Factory_Filter>;
};


export type QueryFactoryArgs = {
  block: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLendgineArgs = {
  block: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLendginesArgs = {
  block: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy: InputMaybe<Lendgine_OrderBy>;
  orderDirection: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where: InputMaybe<Lendgine_Filter>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta: Maybe<_Meta_>;
  factories: Array<Factory>;
  factory: Maybe<Factory>;
  lendgine: Maybe<Lendgine>;
  lendgines: Array<Lendgine>;
};


export type Subscription_MetaArgs = {
  block: InputMaybe<Block_Height>;
};


export type SubscriptionFactoriesArgs = {
  block: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy: InputMaybe<Factory_OrderBy>;
  orderDirection: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where: InputMaybe<Factory_Filter>;
};


export type SubscriptionFactoryArgs = {
  block: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLendgineArgs = {
  block: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLendginesArgs = {
  block: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy: InputMaybe<Lendgine_OrderBy>;
  orderDirection: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where: InputMaybe<Lendgine_Filter>;
};

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type LendginesQueryVariables = Exact<{ [key: string]: never; }>;


export type LendginesQuery = { __typename?: 'Query', lendgines: Array<{ __typename?: 'Lendgine', id: string, token0: string, token1: string, token0Exp: number, token1Exp: number, upperBound: string }> };


export const LendginesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Lendgines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lendgines"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subgraphError"},"value":{"kind":"EnumValue","value":"allow"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token0"}},{"kind":"Field","name":{"kind":"Name","value":"token1"}},{"kind":"Field","name":{"kind":"Name","value":"token0Exp"}},{"kind":"Field","name":{"kind":"Name","value":"token1Exp"}},{"kind":"Field","name":{"kind":"Name","value":"upperBound"}}]}}]}}]} as unknown as DocumentNode<LendginesQuery, LendginesQueryVariables>;