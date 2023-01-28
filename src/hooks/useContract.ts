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
  getContract,
  getMulticall,
  getTokenContract,
  getTokenContractFromAddress,
} from "@dahlia-labs/use-ethers";
import type { Contract } from "@ethersproject/contracts";
import { useMemo } from "react";
import { useProvider, useSigner } from "wagmi";

import ARB_ABI from "../abis/Arbitrage.json";
import FACTORY_ABI from "../abis/Factory.json";
import { ArbitrageAddress } from "../constants";
import { useEnvironment } from "../contexts/environment2";
import type { Arbitrage } from "../generated/Arbitrage";
import type { Factory } from "../generated/Factory";
import type { HookArg } from "./useApproval";
import { useChain } from "./useChain";

export const useFactory = (withSignerIfPossible: boolean): Factory | null => {
  const environment = useEnvironment();
  return useContract(
    (provider: ProviderOrSigner) =>
      getContract(
        environment.base.factory,
        FACTORY_ABI.abi,
        provider
      ) as Factory,
    withSignerIfPossible
  );
};

export function useTokenContractFromAddress(
  tokenAddress: HookArg<string>,
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
  token: HookArg<Token>,
  withSignerIfPossible: boolean
): Erc20 | null {
  return useContract(
    token
      ? (provider: ProviderOrSigner) => getTokenContract(token, provider)
      : null,
    withSignerIfPossible
  );
}

export function useArbitrageContract(
  withSignerIfPossible: boolean
): Arbitrage | null {
  const chain = useChain();
  return useContract(
    (provider: ProviderOrSigner) =>
      getContract(ArbitrageAddress[chain], ARB_ABI.abi, provider) as Arbitrage,
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
