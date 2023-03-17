import type { Provider } from "@wagmi/core";
import type { ContractReceipt } from "ethers";
import { useCallback } from "react";
import { useProvider, useWebSocketProvider } from "wagmi";

export const useAwaitTX = () => {
  const provider = useProvider();
  const webSocketProvider = useWebSocketProvider();

  return useCallback(
    async (hash: string) => awaitTX(webSocketProvider ?? provider, hash),
    [provider, webSocketProvider]
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
