import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { useAllLendgines } from "../../../hooks/useAllLendgines";
import { lendgineToMarket } from "../../../lib/lendgineValidity";
import type { Market } from "../../../lib/types/market";
import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import { dedupe } from "../../../utils/dedupe";
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

  const environment = useEnvironment();

  const lendgines = useAllLendgines();

  const markets = useMemo(() => {
    if (lendgines === null) return null;
    const markets = lendgines.map((l) =>
      lendgineToMarket(
        l,
        environment.interface.wrappedNative,
        environment.interface.specialtyMarkets
      )
    );

    const dedupedMarkets = dedupe(markets, (m) => m[0].address + m[1].address);

    const filteredMarkets =
      assets.length === 0
        ? dedupedMarkets
        : dedupedMarkets.filter(
            (m) =>
              !!assets.find((a) => a.equals(m[0])) ||
              !!assets.find((a) => a.equals(m[1]))
          );

    return filteredMarkets;
  }, [
    assets,
    environment.interface.specialtyMarkets,
    environment.interface.wrappedNative,
    lendgines,
  ]);

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
