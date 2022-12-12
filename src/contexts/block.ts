import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";
import { useProvider } from "wagmi";

const useBlockInternal = (): { blocknumber: number | null } => {
  const [state, setState] = useState<number | null>(null);
  const provider = useProvider();

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (typeof state !== "number") return blockNumber;
        return Math.max(blockNumber, state);
      });
    },
    [setState]
  );

  provider.on("block", blockNumberCallback);

  return { blocknumber: state };
};

export const { Provider: BlockProvider, useContainer: useBlock } =
  createContainer(useBlockInternal);
