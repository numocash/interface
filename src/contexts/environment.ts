import { ChainId } from "@dahlia-labs/celo-contrib";
import { CELO, CUSD } from "@dahlia-labs/celo-tokens";
import type { TokenAmount } from "@dahlia-labs/token-utils";
import { Price, Token } from "@dahlia-labs/token-utils";
import { createContainer } from "unstated-next";

export interface IMarket {
  token: Token;

  address: string;
  pair: IPair;
}

export interface IMarketInfo {
  currentTick: number;
  currentLiquidity: TokenAmount;
  interestNumerator: TokenAmount;
  totalLiquidityBorrowed: TokenAmount;
  totalSupply: TokenAmount;
}

export interface ITickInfo {
  liquidity: TokenAmount;
}

export interface IMarketUserInfo {
  tokenID: number;
  tick: number;
  liquidity: TokenAmount;
}

export interface IPair {
  speculativeToken: Token;
  baseToken: Token;

  lp: Token;

  bound: Price;

  address: string;
}

export interface IPairInfo {
  speculativeAmount: TokenAmount;
  baseAmount: TokenAmount;

  totalLPSupply: TokenAmount;
}

interface Environment {
  markets: readonly IMarket[];
}

const testPair: IPair = {
  speculativeToken: CELO[ChainId.Mainnet],
  baseToken: CUSD[ChainId.Mainnet],

  lp: new Token({
    name: "Numoen LP",
    symbol: "NLP",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0x925A837CDF8D85C3D93800B6817F9379289055aF",
  }),

  bound: new Price(CUSD[ChainId.Mainnet], CELO[ChainId.Mainnet], 1, 5),
  address: "0x925A837CDF8D85C3D93800B6817F9379289055aF",
};

const testMarket: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "NLDG",
    decimals: 36,
    chainId: ChainId.Mainnet,
    address: "0xcbfE63545dc97D20d22dbf3391fcDc7845a5E454",
  }),

  address: "0xcbfE63545dc97D20d22dbf3391fcDc7845a5E454",
  pair: testPair,
};

export const FACTORY = "0x519C8f2D26a656d12582f418d6B460e57867ee5e";
export const LIQUIDITYMANAGER = "0x9ac00d1e4220b2c6a9e95f3f20dee107be771aa2";
export const LENDGINEROUTER = "0x87Cf4f31EE557F7188C90FE3E9b7aEDA0B805a61";
export const GENESIS = 15447817;

export const useAddressToMarket = (
  address: string | null | undefined
): IMarket | null => {
  const { markets } = useEnvironment();
  if (!address) return null;

  return markets.find((m) => m.address === address) ?? null;
};

export const useIsMarket = (address: string | null): boolean => {
  const environment = useEnvironment();
  if (address === null) return false;
  return environment.markets.map((m) => m.address).includes(address);
};

const useEnvironmentInternal = (): Environment => {
  return {
    markets: [testMarket] as const,
  };
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
