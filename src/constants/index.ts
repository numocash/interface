import { WETH } from "@dahlia-labs/numoen-config";
import type { ChainsV1 } from "@dahlia-labs/numoen-utils";
import { Token } from "@dahlia-labs/token-utils";
import { chainID } from "@dahlia-labs/use-ethers";
import { AddressZero } from "@ethersproject/constants";

import { useChain } from "../hooks/useChain";

export const liquidityManagerGenesis: { [chain in ChainsV1]: number } = {
  goerli: 8026628,
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

export const useIsWrappedNative = (token: Token) => {
  const chain = useChain();
  const native = NativeTokens[chain][0];
  return token === native;
};

export const useNative = () => {
  const chain = useChain();
  return NativeTokens[chain][1];
};
