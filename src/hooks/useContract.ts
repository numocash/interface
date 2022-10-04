import { ChainId } from "@dahlia-labs/celo-contrib";
import type { Token } from "@dahlia-labs/token-utils";
import { getContract, getMulticall } from "@dahlia-labs/use-ethers";
import { Interface } from "@ethersproject/abi";
import type { Contract, ContractInterface } from "@ethersproject/contracts";
import { useMemo } from "react";
import { useProvider, useSigner } from "wagmi";

import ERC20_ABI from "../abis/erc20.json";
import LENDGINE_ABI from "../abis/Lendgine.json";
import LM_ABI from "../abis/LiquidityManager.json";
import POSITION_ABI from "../abis/Position.json";
import { LIQUIDITYMANAGER } from "../contexts/environment";
import type {
  Erc20,
  Lendgine,
  LiquidityManager,
  Multicall2,
} from "../generated";
import type { LendgineInterface } from "../generated/Lendgine";
import type { PositionInterface } from "../generated/Position";

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

export const lendgineInterface = new Interface(
  LENDGINE_ABI.abi
) as LendgineInterface;

export function useLiquidityManager(
  withSignerIfPossible: boolean
): LiquidityManager | null {
  return useContract(
    LIQUIDITYMANAGER,
    LM_ABI.abi,
    withSignerIfPossible
  ) as LiquidityManager | null;
}

export const positionInterface = new Interface(
  POSITION_ABI.abi
) as PositionInterface;

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
