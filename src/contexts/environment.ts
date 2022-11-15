import { ChainId } from "@dahlia-labs/celo-contrib";
import { CELO, CUSD, MOBI } from "@dahlia-labs/celo-tokens";
import type { TokenAmount } from "@dahlia-labs/token-utils";
import { Price, Token } from "@dahlia-labs/token-utils";
import { useCallback } from "react";
import { createContainer } from "unstated-next";

export interface IMarket {
  token: Token;

  address: string;
  pair: IPair;
  referenceMarket: string;
}

export interface IMarketInfo {
  totalLiquidity: TokenAmount;
  totalLiquidityBorrowed: TokenAmount;
  rewardPerLiquidityStored: TokenAmount;
  totalSupply: TokenAmount;
  lastUpdate: number;
}

export interface IMarketUserInfo {
  tokenID: number;
  liquidity: TokenAmount;
  market: IMarket;
}

export interface IPair {
  speculativeToken: Token;
  baseToken: Token;

  lp: Token;

  bound: Price;
  baseScaleFactor: number;
  speculativeScaleFactor: number;

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

const LongCelo: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "CELO²",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0x959bf9Ae65ED14f29dBCea1919456fF4CdF7Be22",
  }),

  address: "0x959bf9Ae65ED14f29dBCea1919456fF4CdF7Be22",
  pair: {
    speculativeToken: CELO[ChainId.Mainnet],
    baseToken: CUSD[ChainId.Mainnet],

    lp: new Token({
      name: "Numoen LP",
      symbol: "NLP",
      decimals: 18,
      chainId: ChainId.Mainnet,
      address: "0x9c3486de1E41eA2b5e88ea5c8a04f4F93eBD248E",
    }),

    bound: new Price(CUSD[ChainId.Mainnet], CELO[ChainId.Mainnet], 1, 5),
    baseScaleFactor: 18,
    speculativeScaleFactor: 18,
    address: "0x9c3486de1E41eA2b5e88ea5c8a04f4F93eBD248E",
  },
  referenceMarket: "0x1e593f1fe7b61c53874b54ec0c59fd0d5eb8621e",
};

const ShortCelo: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "cUSD²",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0x40FCde0c9619969834BBBC63b7816716ace4B194",
  }),

  address: "0x40FCde0c9619969834BBBC63b7816716ace4B194",
  pair: {
    speculativeToken: CUSD[ChainId.Mainnet],
    baseToken: CELO[ChainId.Mainnet],

    lp: new Token({
      name: "Numoen LP",
      symbol: "NLP",
      decimals: 18,
      chainId: ChainId.Mainnet,
      address: "0x8daE985062Ada6e316dC168012bA14EF19fB1Ac4",
    }),

    bound: new Price(CELO[ChainId.Mainnet], CUSD[ChainId.Mainnet], 1, 5),
    baseScaleFactor: 18,
    speculativeScaleFactor: 18,
    address: "0x8daE985062Ada6e316dC168012bA14EF19fB1Ac4",
  },
  referenceMarket: "0x1e593f1fe7b61c53874b54ec0c59fd0d5eb8621e",
};

const Mobi: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "MOBI²",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0xF0A7B77903c8689318010B47c122b00670D25CB3",
  }),

  address: "0xF0A7B77903c8689318010B47c122b00670D25CB3",
  pair: {
    speculativeToken: MOBI[ChainId.Mainnet],
    baseToken: CUSD[ChainId.Mainnet],

    lp: new Token({
      name: "Numoen LP",
      symbol: "NLP",
      decimals: 18,
      chainId: ChainId.Mainnet,
      address: "0x9F65Eb0C206640683Ce0644344687e704119E3cF",
    }),

    bound: new Price(CUSD[ChainId.Mainnet], MOBI[ChainId.Mainnet], 1000, 1),
    baseScaleFactor: 18,
    speculativeScaleFactor: 18,
    address: "0x9F65Eb0C206640683Ce0644344687e704119E3cF",
  },
  referenceMarket: "0x1eb738ec1d46c9befe95e830e19d0f537619f2d7",
};

export const FACTORY = "0x4Ef9A0Eea3B521478762Df70d6127eeF3d386B22";
export const LIQUIDITYMANAGER = "0xb28901b0f30b261a81850fcf21892d4830475a3b";
export const LENDGINEROUTER = "0x6805fecb7a01b1ce5cd322ce65cfe5dcd0ddbc4e";
export const GENESIS = 15948000;

export const useAddressToMarket = (
  address: string | null | undefined
): IMarket | null => {
  const { markets } = useEnvironment();
  if (!address) return null;

  return markets.find((m) => m.address === address) ?? null;
};

export const useGetAddressToMarket = () => {
  const { markets } = useEnvironment();
  return useCallback(
    (address: string | null | undefined) => {
      if (!address) return null;
      return markets.find((m) => m.address === address) ?? null;
    },
    [markets]
  );
};

export const useGetSpeculativeToMarket = () => {
  const { markets } = useEnvironment();
  return useCallback(
    (speculative: Token) => {
      return markets.find((m) => m.pair.speculativeToken === speculative);
    },
    [markets]
  );
};

export const useIsMarket = (address: string | null): boolean => {
  const environment = useEnvironment();
  if (address === null) return false;
  return environment.markets.map((m) => m.address).includes(address);
};

const useEnvironmentInternal = (): Environment => {
  return {
    markets: [LongCelo, Mobi] as const,
  };
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
