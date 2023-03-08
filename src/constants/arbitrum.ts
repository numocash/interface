import { chainID } from "@dahlia-labs/use-ethers";
import { getAddress } from "@ethersproject/address";
import { Ether } from "@uniswap/sdk-core";

import { Stable, WrappedNative } from "./tokens";

export const arbitrumConfig = {
  base: {
    factory: getAddress("0x8396a792510a402681812ece6ad3ff19261928ba"),
    lendgineRouter: getAddress("0x6a931466f6C79724CB5E78EaB6E493b6AF189FF0"),
    liquidityManager: getAddress("0x6b0c66824c39766f554F07481B66ca24A54A90E0"),
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
    stablecoin: Stable[chainID.arbitrum],
    blockFreq: 10,
  },
} as const;
