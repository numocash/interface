import { weth } from "@dahlia-labs/numoen-config";
import type { ChainsV1 } from "@dahlia-labs/numoen-utils";
import { Token } from "@dahlia-labs/token-utils";
import { chainID } from "@dahlia-labs/use-ethers";
import { getAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import type { Address } from "wagmi";

import { CELO_CELO, CELO_CUSD } from "./tokens";

export const liquidityManagerGenesis: { [chain in ChainsV1]: number } = {
  goerli: 8055410,
  arbitrum: 42997088,
};

export const ArbitrageAddress: { [chain in ChainsV1]: string } = {
  goerli: "0x29874Aa4cc27D7294929Ed01d11C3749f5eca8E0",
  arbitrum: "0x29874Aa4cc27D7294929Ed01d11C3749f5eca8E0",
};

export const NativeTokens: { [chain in ChainsV1]: [Token, Token] } = {
  goerli: [
    weth.goerli,
    new Token({
      name: "Ether",
      symbol: "ETH",
      address: AddressZero,
      decimals: 18,
      chainId: chainID.goerli,
      logoURI:
        "https://raw.githubusercontent.com/Numoen/config/master/src/images/eth.jpg",
    }),
  ],
  arbitrum: [
    weth.arbitrum,
    new Token({
      name: "Ether",
      symbol: "ETH",
      address: AddressZero,
      decimals: 18,
      chainId: chainID.arbitrum,
      logoURI:
        "https://raw.githubusercontent.com/Numoen/config/master/src/images/eth.jpg",
    }),
  ],
};

export type SupportedChains = keyof Pick<
  typeof chainID,
  "celo"
  // "arbitrum" | "celo" | "polygon"
>;

// TODO: where to put factory address of uniswapv2 and v3
export type NumoenBaseConfig = {
  factory: Address;
  lendgineRouter: Address;
  liquidityManager: Address;
};

// TODO: CELO doesn't need to be used as a native token
export type NumoenInterfaceConfig = {
  uniswapV2subgraph: string;
  uniswapV3subgraph: string;
  wrappedNative: Token;
  stablecoin: Token;
  defaultActiveLists: string[];
  defaultInactiveLists: string[];
};

export const config: {
  [chain in SupportedChains]: {
    interface: NumoenInterfaceConfig;
    base: NumoenBaseConfig;
  };
} = {
  // arbitrum: {
  //   interface: {
  //     uniswapV2subgraph:
  //       "https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup",
  //     uniswapV3subgraph:
  //       "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev",
  //     wrappedNative: ARBI_WETH,
  //     stablecoin: ARBI_USDC,
  //     defaultActiveLists: [
  //       "https://tokens.uniswap.org",
  //       "https://bridge.arbitrum.io/token-list-42161.json",
  //     ],
  //     defaultInactiveLists: [],
  //   },
  // },
  celo: {
    interface: {
      uniswapV2subgraph:
        "https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap",
      uniswapV3subgraph:
        "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
      wrappedNative: CELO_CELO,
      stablecoin: CELO_CUSD,
      defaultActiveLists: [
        "https://tokens.uniswap.org",
        "https://celo-org.github.io/celo-token-list/celo.tokenlist.json",
      ],
      defaultInactiveLists: [],
    },
    base: {
      factory: getAddress("0x09C1133669cB9b49704Dc27aE0b523Be74467f2A"),
      liquidityManager: getAddress(
        "0x0D0932B07Aca7Ea902d2432e70e054DE8B12A834"
      ),
      lendgineRouter: getAddress("0x4D908e627C8E5126558Dc29B46dF2c9b5B150470"),
    },
  },
};
