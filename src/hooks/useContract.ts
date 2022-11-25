import { ChainId } from "@dahlia-labs/celo-contrib";
import { LENDGINEROUTER, LIQUIDITYMANAGER } from "@dahlia-labs/numoen-utils";
import type { Token } from "@dahlia-labs/token-utils";
import { getContract, getMulticall } from "@dahlia-labs/use-ethers";
import { Interface } from "@ethersproject/abi";
import type { Contract, ContractInterface } from "@ethersproject/contracts";
import { useMemo } from "react";
import { useProvider, useSigner } from "wagmi";

import ERC20_ABI from "../abis/erc20.json";
import UP_ABI from "../abis/IUniswapV2Pair.json";
import LENDGINE_ABI from "../abis/Lendgine.json";
import LR_ABI from "../abis/LendgineRouter.json";
import LM_ABI from "../abis/LiquidityManager.json";
import PAIR_ABI from "../abis/Pair.json";
import type {
  Erc20,
  Lendgine,
  LendgineRouter,
  LiquidityManager,
  Multicall2,
} from "../generated";
import type { IUniswapV2PairInterface } from "../generated/IUniswapV2Pair";
import type { LendgineInterface } from "../generated/Lendgine";
import type { PairInterface } from "../generated/Pair";

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

export const uniswapPairInterface = new Interface(
  UP_ABI.abi
) as IUniswapV2PairInterface;

export const pairInterface = new Interface(PAIR_ABI.abi) as PairInterface;

export function useLiquidityManager(
  withSignerIfPossible: boolean
): LiquidityManager | null {
  return useContract(
    LIQUIDITYMANAGER,
    LM_ABI.abi,
    withSignerIfPossible
  ) as LiquidityManager | null;
}

export function useLendgineRouter(
  withSignerIfPossible: boolean
): LendgineRouter | null {
  return useContract(
    LENDGINEROUTER,
    LR_ABI.abi,
    withSignerIfPossible
  ) as LendgineRouter | null;
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
