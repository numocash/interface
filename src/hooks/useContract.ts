import { ChainId, Multicall } from "@dahlia-labs/celo-contrib";
import type { Token } from "@dahlia-labs/token-utils";
import { Interface } from "@ethersproject/abi";
import { getAddress } from "@ethersproject/address";
import type { ContractInterface } from "@ethersproject/contracts";
import { Contract } from "@ethersproject/contracts";
import type { Provider } from "@ethersproject/providers";
import type { Signer } from "ethers";
import { useMemo } from "react";
import { useProvider, useSigner } from "wagmi";

import ERC20_ABI from "../abis/erc20.json";
import MULTICALL_ABI from "../abis/multicall2.json";
import type { Erc20, Multicall2 } from "../generated";
import type { Erc20Interface } from "../generated/Erc20";

type ProviderOrSigner = Provider | Signer;

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

// non react

export function getTokenInterface(): Erc20Interface {
  return new Interface(ERC20_ABI) as Erc20Interface;
}

export const getMulticall = (
  chainID: ChainId,
  provider: ProviderOrSigner
): Multicall2 =>
  getContract(Multicall[chainID], MULTICALL_ABI, provider) as Multicall2;

export const getTokenContractFromAddress = (
  address: string,
  provider: ProviderOrSigner
): Erc20 => getContract(address, ERC20_ABI, provider) as Erc20;

export const getTokenContract = (
  token: Token,
  provider: ProviderOrSigner
): Erc20 => getContract(token.address, ERC20_ABI, provider) as Erc20;

function getContract(
  address: string,
  ABI: ContractInterface,
  provider: ProviderOrSigner
): Contract {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return new Contract(address, ABI, provider);
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}
