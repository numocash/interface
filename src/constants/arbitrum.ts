import { Ether } from "@uniswap/sdk-core";
import { utils } from "ethers";

import { chainID } from "../lib/constants";
import { WrappedTokenInfo } from "../lib/types/wrappedTokenInfo";
import { Stable, WrappedNative } from "./tokens";

const USDT = new WrappedTokenInfo({
  name: "Tether USD",
  address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  symbol: "USDT",
  decimals: 6,
  chainId: 42161,
  logoURI:
    "https://assets.coingecko.com/coins/images/325/small/Tether.png?1668148663",
});

export const arbitrumConfig = {
  base: {
    factory: utils.getAddress("0x8396a792510a402681812ece6ad3ff19261928ba"),
    lendgineRouter: utils.getAddress(
      "0x6a931466f6C79724CB5E78EaB6E493b6AF189FF0"
    ),
    liquidityManager: utils.getAddress(
      "0x6b0c66824c39766f554F07481B66ca24A54A90E0"
    ),
  },
  interface: {
    uniswapV2: {
      subgraph:
        "https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup",
      factoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
      pairInitCodeHash:
        "0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303",
      routerAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    },
    uniswapV3: {
      subgraph:
        "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev",
      factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      pairInitCodeHash:
        "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54",
      quoterAddress: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    },
    numoenSubgraph:
      "https://api.thegraph.com/subgraphs/name/kyscott18/numoen-arbitrum",
    wrappedNative: WrappedNative[chainID.arbitrum],
    native: Ether.onChain(chainID.arbitrum),
    specialtyMarkets: [
      { base: Stable[chainID.arbitrum], quote: USDT },
      {
        base: WrappedNative[chainID.arbitrum],
        quote: Stable[chainID.arbitrum],
      },
    ],
    blockFreq: 25,
  },
} as const;
