import { ChainId } from "@dahlia-labs/celo-contrib";
import { CELO, CUSD, MOBI, UBE } from "@dahlia-labs/celo-tokens";
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
  rewardPerLiquidityPaid: TokenAmount;
  tokensOwed: TokenAmount;
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
    symbol: "CELO+",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0x24aceAE438C60DD6ba937B27345531115a099048",
  }),

  address: "0x24aceAE438C60DD6ba937B27345531115a099048",
  pair: {
    speculativeToken: CELO[ChainId.Mainnet],
    baseToken: CUSD[ChainId.Mainnet],

    lp: new Token({
      name: "Numoen LP",
      symbol: "NLP",
      decimals: 18,
      chainId: ChainId.Mainnet,
      address: "0xFD634643275d2EA018F6D13b88244ca5BB96564C",
    }),

    bound: new Price(CUSD[ChainId.Mainnet], CELO[ChainId.Mainnet], 1, 5),
    baseScaleFactor: 18,
    speculativeScaleFactor: 18,
    address: "0xFD634643275d2EA018F6D13b88244ca5BB96564C",
  },
  referenceMarket: "0x1e593f1fe7b61c53874b54ec0c59fd0d5eb8621e",
};

const Mobi: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "MOBI+",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0x480E0860F64FD42c0aCbB90FAD33C4Fa059e7d95",
  }),

  address: "0x480E0860F64FD42c0aCbB90FAD33C4Fa059e7d95",
  pair: {
    speculativeToken: MOBI[ChainId.Mainnet],
    baseToken: CELO[ChainId.Mainnet],

    lp: new Token({
      name: "Numoen LP",
      symbol: "NLP",
      decimals: 18,
      chainId: ChainId.Mainnet,
      address: "0x3D9222F94CCf6993f62A88D59D9A5Af1A0c351e5",
    }),

    bound: new Price(CELO[ChainId.Mainnet], MOBI[ChainId.Mainnet], 1000, 2),
    baseScaleFactor: 18,
    speculativeScaleFactor: 18,
    address: "0x3D9222F94CCf6993f62A88D59D9A5Af1A0c351e5",
  },
  referenceMarket: "0x0b81cf47c8f97275d14c006e537d5101b6c87300",
};

const Ube: IMarket = {
  token: new Token({
    name: "Numoen Lendgine",
    symbol: "UBE+",
    decimals: 18,
    chainId: ChainId.Mainnet,
    address: "0xd89F5fd3F6df3FD68Ca7604566DE25c2C3Dd5EAd",
  }),
  address: "0xd89F5fd3F6df3FD68Ca7604566DE25c2C3Dd5EAd",
  pair: {
    speculativeToken: UBE[ChainId.Mainnet],
    baseToken: CELO[ChainId.Mainnet],

    lp: new Token({
      name: "Numoen LP",
      symbol: "NLP",
      decimals: 18,
      chainId: ChainId.Mainnet,
      address: "0x89AE09FBe40Dc4436c0F1D3dde0d50cC6d000D97",
    }),

    bound: new Price(CELO[ChainId.Mainnet], UBE[ChainId.Mainnet], 10, 2),
    baseScaleFactor: 18,
    speculativeScaleFactor: 18,
    address: "0x89AE09FBe40Dc4436c0F1D3dde0d50cC6d000D97",
  },
  referenceMarket: "0xe7b5ad135fa22678f426a381c7748f6a5f2c9e6c",
};

export const FACTORY = "0x60ba0a7dcd2caa3eb171f0a8692a37d34900e247";
export const LIQUIDITYMANAGER = "0x1fc287beadff8ac1d333566f1de19c36840ba96f";
export const LENDGINEROUTER = "0xb004e43ba5a34d95dfbce8834b359b523cbf358c";
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
    markets: [LongCelo, Mobi, Ube] as const,
  };
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
