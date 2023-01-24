import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token } from "@dahlia-labs/token-utils";
import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../contexts/environment";
import { Display } from "./Display";
import { Explain } from "./Explain";
import { Filter } from "./Filter";
import { Markets } from "./Markets";

interface ITrade {
  assets: readonly Token[];
  setAssets: (val: readonly Token[]) => void;
  markets: readonly IMarket[];
}

const useTradeInternal = (): ITrade => {
  const [assets, setAssets] = useState<readonly Token[]>([]);

  const { markets } = useEnvironment();

  const filteredMarkets = useMemo(() => {
    if (assets.length === 0) return markets;

    return markets.filter(
      (m) =>
        assets.includes(m.pair.baseToken) ||
        assets.includes(m.pair.speculativeToken)
    );
  }, [assets, markets]);

  return { assets, setAssets, markets: filteredMarkets };
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
