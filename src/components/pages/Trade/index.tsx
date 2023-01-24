import type { Token } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { createContainer } from "unstated-next";

import { Explain } from "./Explain";
import { Filter } from "./Filter";
import { Markets } from "./Markets";
import { Sort } from "./Sort";

interface ITrade {
  assets: readonly Token[];
  setAssets: (val: readonly Token[]) => void;
}

const useTradeInternal = (): ITrade => {
  const [assets, setAssets] = useState<readonly Token[]>([]);

  return { assets, setAssets };
};

export const { Provider: TradeProvider, useContainer: useTrade } =
  createContainer(useTradeInternal);

export const Trade: React.FC = () => {
  return (
    <div tw="flex flex-col gap-4 w-full max-w-xl">
      <TradeProvider>
        <Explain />
        <p tw="text-xs text-default">
          Displaying <span tw="font-semibold">1 markets</span>
        </p>
        <div tw="flex gap-4">
          <Filter />
          <Sort />
        </div>
        <Markets />
      </TradeProvider>
    </div>
  );
};
