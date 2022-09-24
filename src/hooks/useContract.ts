import { ChainId } from "@dahlia-labs/celo-contrib";
import type { Token } from "@dahlia-labs/token-utils";
import { getContract, getMulticall } from "@dahlia-labs/use-ethers";
import type { Contract, ContractInterface } from "@ethersproject/contracts";
import { useMemo } from "react";
import { useProvider, useSigner } from "wagmi";

import ERC20_ABI from "../abis/erc20.json";
import LENDGINE_ABI from "../abis/Lendgine.json";
import MINTROUTER_ABI from "../abis/MintRouter.json";
import { MINT_ROUTER } from "../contexts/environment";
import type { Erc20, Lendgine, MintRouter, Multicall2 } from "../generated";

export function useTokenContractFromAddress(
  tokenAddress: string | undefined,
  withSignerIfPossible: boolean
): Erc20 | null {
  return useContract(
    tokenAddress,
    ERC20_ABI,
    withSignerIfPossible
  ) as Erc20 | null;
}

export function useTokenContract(
  token: Token | undefined,
  withSignerIfPossible: boolean
): Erc20 | null {
  return useContract(
    token?.address,
    ERC20_ABI,
    withSignerIfPossible
  ) as Erc20 | null;
}

export function useLendgineContract(
  address: string | undefined,
  withSignerIfPossible: boolean
): Lendgine | null {
  return useContract(
    address,
    LENDGINE_ABI.abi,
    withSignerIfPossible
  ) as Lendgine | null;
}

export function useMintRouterContract(
  withSignerIfPossible: boolean
): MintRouter | null {
  return useContract(
    MINT_ROUTER,
    MINTROUTER_ABI.abi,
    withSignerIfPossible
  ) as MintRouter | null;
}

export function useMulticall(): Multicall2 {
  const provider = useProvider();
  const chainID = ChainId.Mainnet;
  return getMulticall(chainID, provider);
}

function useContract(
  address: string | undefined,
  ABI: ContractInterface,
  withSignerIfPossible: boolean
): Contract | null {
  const provider = useProvider();
  const signer = useSigner().data;

  return useMemo(() => {
    if (!address) return null;

    return getContract(
      address,
      ABI,
      withSignerIfPossible && signer ? signer : provider
    );
  }, [address, ABI, withSignerIfPossible, signer, provider]);
}
