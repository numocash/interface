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
  tick: number;
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
    address: "0xDA4c13f913CA412C41FaF7a11D8A03D41b731551",
  }),

  bound: new Price(CUSD[ChainId.Mainnet], CELO[ChainId.Mainnet], 1, 5),
  address: "0xDA4c13f913CA412C41FaF7a11D8A03D41b731551",
};

const testMarket: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "NLDG",
    decimals: 36,
    chainId: ChainId.Mainnet,
    address: "0xF0c88240b6d25831dC5E8b542b65f198BAAEfA9F",
  }),

  address: "0xF0c88240b6d25831dC5E8b542b65f198BAAEfA9F",
  pair: testPair,
};

export const FACTORY = "0x95c62A69B6a7da59318256B2ef8a39fda347F7B2";
export const LIQUIDITYMANAGER = "0x41036e7DA2eA3Df340DbFF9030821FCF44b6910b";
export const LENDGINEROUTER = "0xaDF94da27b54a17C128f035BB7bA8165AF290265";
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
