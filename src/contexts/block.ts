import type { ContractReceipt } from "@ethersproject/contracts";
import { WebSocketProvider } from "@ethersproject/providers";
import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";

const webSocketProvider = new WebSocketProvider(
  "wss://goerli.infura.io/ws/v3/6f9c9bc239054e9fb755198cc1e4973a"
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
