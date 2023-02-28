import { chainID } from "@dahlia-labs/use-ethers";
import { getAddress } from "@ethersproject/address";

import { Stable, WrappedNative } from "./tokens";

export const celoConfig = {
  base: {
    factory: getAddress("0x8396a792510a402681812ece6ad3ff19261928ba"),
    lendgineRouter: getAddress("0x6a931466f6C79724CB5E78EaB6E493b6AF189FF0"),
    liquidityManager: getAddress("0x6b0c66824c39766f554F07481B66ca24A54A90E0"),
  },
  interface: {
    uniswapV2subgraph:
      "https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap",
    uniswapV3subgraph:
      "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
    numoenSubgraph:
      "https://api.thegraph.com/subgraphs/name/kyscott18/numoen-celo",
    wrappedNative: WrappedNative[chainID.celo],
    stablecoin: Stable[chainID.celo],
  },
};
