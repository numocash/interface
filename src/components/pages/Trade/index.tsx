import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import type { Lendgine } from "../../../constants";
import { useEnvironment } from "../../../contexts/environment2";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { Display } from "./Display";
import { Explain } from "./Explain";
import { Filter } from "./Filter";
import { Markets } from "./Markets";

interface ITrade {
  assets: readonly WrappedTokenInfo[];
  setAssets: (val: readonly WrappedTokenInfo[]) => void;
  lendgines: readonly Lendgine[];
}

const useTradeInternal = (): ITrade => {
  const [assets, setAssets] = useState<readonly WrappedTokenInfo[]>([]);

  const environment = useEnvironment();
  const lendgines = environment.lendgines;

  const filteredMarkets = useMemo(() => {
    if (assets.length === 0) return lendgines;

    return lendgines.filter(
      (l) => assets.includes(l.token0) || assets.includes(l.token1)
    );
  }, [assets, lendgines]);

  return { assets, setAssets, lendgines: filteredMarkets };
};

export const { Provider: TradeProvider, useContainer: useTrade } =
  createContainer(useTradeInternal);

export const Trade: React.FC = () => {
  return (
    <div tw="flex flex-col gap-4 w-full max-w-xl">
      <TradeProvider>
        <Explain />
        <Display />
        <div tw="flex gap-4">
          <Filter />
          {/* <Sort /> */}
        </div>
        <Markets />
      </TradeProvider>
    </div>
  );
};
