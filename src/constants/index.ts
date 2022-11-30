import { WETH } from "@dahlia-labs/numoen-config";
import type { ChainsV1 } from "@dahlia-labs/numoen-utils";
import { Token } from "@dahlia-labs/token-utils";
import { chainID } from "@dahlia-labs/use-ethers";
import { AddressZero } from "@ethersproject/constants";

export const liquidityManagerGenesis: { [chain in ChainsV1]: number } = {
  goerli: 8049837,
};

const ETH = new Token({
  name: "Ether",
  symbol: "ETH",
  address: AddressZero,
  decimals: 18,
  chainId: chainID.goerli,
  logoURI:
    "https://raw.githubusercontent.com/Numoen/config/master/src/images/eth.jpg",
});

export const NativeTokens: { [chain in ChainsV1]: [Token, Token] } = {
  goerli: [WETH, ETH],
};
