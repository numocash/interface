import { Token } from "@dahlia-labs/token-utils";
import { chainID } from "@dahlia-labs/use-ethers";

export const ARBI_USDC = new Token({
  address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  chainId: chainID.arbitrum,
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
});

export const ARBI_WETH = new Token({
  address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  chainId: chainID.arbitrum,
  name: "Wrapped Ether",
  symbol: "ETH",
  decimals: 18,
});
