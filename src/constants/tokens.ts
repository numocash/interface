import { chainID } from "@dahlia-labs/use-ethers";
import { getAddress } from "@ethersproject/address";
import { Token } from "@uniswap/sdk-core";

export const Stable = {
  1: new Token(
    1,
    getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    6,
    "USDC",
    "USD Coin"
  ),
  [chainID.arbitrum]: new Token(
    chainID.arbitrum,
    getAddress("0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"),
    6,
    "USD Coin",
    "USDC"
  ),
  [chainID.celo]: new Token(
    chainID.celo,
    getAddress("0x765DE816845861e75A25fCA122bb6898B8B1282a"),
    18,
    "Celo Dollar",
    "cUSD"
  ),
} as const;

export const WrappedNative = {
  1: new Token(
    1,
    getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    18,
    "WETH",
    "Wrapped Ether"
  ),
  [chainID.arbitrum]: new Token(
    chainID.arbitrum,
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    18,
    "WETH",
    "Wrapped Ether"
  ),
  [chainID.celo]: new Token(
    chainID.celo,
    getAddress("0x471EcE3750Da237f93B8E339c536989b8978a438"),
    18,
    "Celo native asset",
    "CELO"
  ),
} as const;
