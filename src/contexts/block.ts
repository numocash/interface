import type { ContractReceipt } from "@ethersproject/contracts";
import { WebSocketProvider } from "@ethersproject/providers";
import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";

const webSocketProvider = new WebSocketProvider(
  "wss://chaotic-tiniest-asphalt.celo-mainnet.discover.quiknode.pro/2fc0e56df28958791722e76f556e061b611c57f4/"
);

export const useAwaitTX = () =>
  useCallback(
    async (hash: string) =>
      new Promise((resolve: (e: ContractReceipt) => void) =>
        webSocketProvider.once(hash, (e: ContractReceipt) => {
          resolve(e);
          return e;
        })
      ),
    []
  );

const useBlockInternal = (): { blocknumber: number | null } => {
  const [state, setState] = useState<number | null>(null);

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (typeof state !== "number") return blockNumber;
        return Math.max(blockNumber, state);
      });
    },
    [setState]
  );

  webSocketProvider.on("block", blockNumberCallback);

  return { blocknumber: state };
};

export const { Provider: BlockProvider, useContainer: useBlock } =
  createContainer(useBlockInternal);
