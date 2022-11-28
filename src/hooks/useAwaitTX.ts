import type { ContractReceipt } from "@ethersproject/contracts";
import type { Provider } from "@ethersproject/providers";
import { useCallback } from "react";
import { useProvider } from "wagmi";

export const useAwaitTX = () => {
  const provider = useProvider();

  return useCallback(
    async (hash: string) => awaitTX(provider, hash),
    [provider]
  );
};

export const awaitTX = async (
  provider: Provider,
  txHash: string
): Promise<ContractReceipt> =>
  new Promise((resolve: (e: ContractReceipt) => void) =>
    provider.once(txHash, (e: ContractReceipt) => {
      resolve(e);
      return e;
    })
  );
