import type {
  LendgineRouter,
  LiquidityManager,
} from "@dahlia-labs/numoen-utils";
import {
  getLendgineRouterContract,
  getLiquidityManagerContract,
} from "@dahlia-labs/numoen-utils";
import type { Token } from "@dahlia-labs/token-utils";
import type {
  Erc20,
  Multicall2,
  ProviderOrSigner,
} from "@dahlia-labs/use-ethers";
import {
  getMulticall,
  getTokenContract,
  getTokenContractFromAddress,
} from "@dahlia-labs/use-ethers";
import type { Contract } from "@ethersproject/contracts";
import { useMemo } from "react";
import { useProvider, useSigner } from "wagmi";

import { useChain } from "./useChain";

export function useTokenContractFromAddress(
  tokenAddress: string | null | undefined,
  withSignerIfPossible: boolean
): Erc20 | null {
  return useContract(
    tokenAddress
      ? (provider: ProviderOrSigner) =>
          getTokenContractFromAddress(tokenAddress, provider)
      : null,
    withSignerIfPossible
  );
}

export function useTokenContract(
  token: Token | null | undefined,
  withSignerIfPossible: boolean
): Erc20 | null {
  return useContract(
    token
      ? (provider: ProviderOrSigner) => getTokenContract(token, provider)
      : null,
    withSignerIfPossible
  );
}

export function useLiquidityManager(
  withSignerIfPossible: boolean
): LiquidityManager | null {
  const chain = useChain();
  return useContract(
    (provider: ProviderOrSigner) =>
      getLiquidityManagerContract(provider, chain),
    withSignerIfPossible
  );
}

export function useLendgineRouter(
  withSignerIfPossible: boolean
): LendgineRouter | null {
  const chain = useChain();
  return useContract(
    (provider: ProviderOrSigner) => getLendgineRouterContract(provider, chain),
    withSignerIfPossible
  );
}

export function useMulticall(): Multicall2 {
  const provider = useProvider();
  const chain = useChain();
  return getMulticall(provider, chain);
}

function useContract<T extends Contract>(
  callback: ((provider: ProviderOrSigner) => T) | null,
  withSignerIfPossible: boolean
): T | null {
  const provider = useProvider();
  const signer = useSigner().data;

  return useMemo(() => {
    return callback
      ? callback(withSignerIfPossible && signer ? signer : provider)
      : null;
  }, [callback, withSignerIfPossible, signer, provider]);
}
