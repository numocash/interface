import { ChainId } from "@dahlia-labs/celo-contrib";
import { CELO, CUSD } from "@dahlia-labs/celo-tokens";

export const useCelo = () => {
  const chainId = ChainId.Mainnet;
  return CELO[chainId];
};

export const useCusd = () => {
  const chainId = ChainId.Mainnet;

  return CUSD[chainId];
};
