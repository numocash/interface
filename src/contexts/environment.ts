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

export interface IMarketUserInfo {
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
    address: "0x6ae85c154e67ad0d08634957da1907ad7d23b325",
  }),

  bound: new Price(CUSD[ChainId.Mainnet], CELO[ChainId.Mainnet], 2, 5),

  address: "0x6ae85c154e67ad0d08634957da1907ad7d23b325",
};

const testMarket: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "NLDG",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0x6fbb3a7063842ef77cd75baeb4ac7776cd988166",
  }),

  address: "0x6fbb3a7063842ef77cd75baeb4ac7776cd988166",

  pair: testPair,
};

export const FACTORY = "0xb0C7E6bC7577706F766efA012f6604919056D0f7";

export const UBE_FACTORY = "0x62d5b84bE28a183aBB507E125B384122D2C25fAE";

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
