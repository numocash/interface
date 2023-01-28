import { Token } from "@dahlia-labs/token-utils";
import { chainID } from "@dahlia-labs/use-ethers";
import { getAddress } from "@ethersproject/address";

export const ARBI_USDC = new Token({
  address: getAddress("0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"),
  chainId: chainID.arbitrum,
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
});

export const ARBI_WETH = new Token({
  address: getAddress("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"),
  chainId: chainID.arbitrum,
  name: "Wrapped Ether",
  symbol: "ETH",
  decimals: 18,
});

export const CELO_CUSD = new Token({
  address: getAddress("0x765DE816845861e75A25fCA122bb6898B8B1282a"),
  chainId: chainID.celo,
  name: "Celo Dollar",
  symbol: "cUSD",
  decimals: 18,
});

export const CELO_CELO = new Token({
  address: getAddress("0x471EcE3750Da237f93B8E339c536989b8978a438"),
  chainId: chainID.celo,
  name: "Celo native asset",
  symbol: "CELO",
  decimals: 18,
});
