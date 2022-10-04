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
    address: "0x63dB6522a34ab2F8E5f3B5766725462F7147Ef16",
  }),

  bound: new Price(CUSD[ChainId.Mainnet], CELO[ChainId.Mainnet], 1, 5),
  address: "0x63dB6522a34ab2F8E5f3B5766725462F7147Ef16",
};

const testMarket: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "NLDG",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0x0BDd71913078E1930F882a56Ea7f537D0a84Aec0",
  }),

  address: "0x0BDd71913078E1930F882a56Ea7f537D0a84Aec0",
  pair: testPair,
};

export const FACTORY = "0x8391fAeB0fED26D3B57A08E4809575fCD1D2d00C";
export const LIQUIDITYMANAGER = "0x25B1FbeC46A08c9bB3026c95A6394ACae4F462AF";

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
