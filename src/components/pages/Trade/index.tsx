import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../contexts/environment2";
import type { Market } from "../../../hooks/useMarket";
import {
  dedupeMarkets,
  useGetLendgineToMarket,
} from "../../../hooks/useMarket";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import type { Sorts } from "./Sort";
import { TradeInner } from "./TradeInner";

interface ITrade {
  assets: readonly WrappedTokenInfo[];
  setAssets: (val: readonly WrappedTokenInfo[]) => void;

  sort: keyof typeof Sorts;
  setSort: (val: keyof typeof Sorts) => void;

  markets: readonly Market[];
}

const useTradeInternal = (): ITrade => {
  const [assets, setAssets] = useState<readonly WrappedTokenInfo[]>([]);
  const [sort, setSort] = useState<keyof typeof Sorts>("default");

  const environment = useEnvironment();
  const lendgines = environment.lendgines;

  const getLendgineToMarket = useGetLendgineToMarket();

  const markets = useMemo(() => {
    const markets = lendgines.map((l) => getLendgineToMarket(l));

    const dedupedMarkets = dedupeMarkets(markets);

    const filteredMarkets =
      assets.length === 0
        ? dedupedMarkets
        : dedupedMarkets.filter(
            (m) => assets.includes(m[0]) || assets.includes(m[1])
          );

    return filteredMarkets;
  }, [assets, getLendgineToMarket, lendgines]);

  return {
    assets,
    setAssets,
    sort,
    setSort,
    markets,
  };
};

export const { Provider: TradeProvider, useContainer: useTrade } =
  createContainer(useTradeInternal);

export const Trade: React.FC = () => {
  return (
    <TradeProvider>
      <TradeInner />
    </TradeProvider>
  );
};
