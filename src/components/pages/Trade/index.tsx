import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { useAllLendgines } from "../../../hooks/useLendgine";
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

  markets: readonly Market[] | null;
}

const useTradeInternal = (): ITrade => {
  const [assets, setAssets] = useState<readonly WrappedTokenInfo[]>([]);
  const [sort, setSort] = useState<keyof typeof Sorts>("default");

  const lendgines = useAllLendgines();

  const getLendgineToMarket = useGetLendgineToMarket();

  const markets = useMemo(() => {
    if (lendgines === null) return null;
    const markets = lendgines.map((l) => getLendgineToMarket(l));

    const dedupedMarkets = dedupeMarkets(markets);

    const filteredMarkets =
      assets.length === 0
        ? dedupedMarkets
        : dedupedMarkets.filter(
            (m) =>
              !!assets.find((a) => a.equals(m[0])) ||
              !!assets.find((a) => a.equals(m[1]))
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
