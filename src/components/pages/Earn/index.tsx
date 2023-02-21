import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { useAllLendgines } from "../../../hooks/useLendgine";
import type { Market } from "../../../hooks/useMarket";
import {
  dedupeMarkets,
  useGetLendgineToMarket,
} from "../../../hooks/useMarket";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { EarnInner } from "./EarnInner";

interface IEarn {
  assets: readonly WrappedTokenInfo[];
  setAssets: (val: readonly WrappedTokenInfo[]) => void;

  markets: readonly Market[] | null;
}

const useEarnInternal = (): IEarn => {
  const [assets, setAssets] = useState<readonly WrappedTokenInfo[]>([]);

  const lendgines = useAllLendgines();

  const getLendgineToMarket = useGetLendgineToMarket();

  const markets = useMemo(() => {
    if (!lendgines) return null;
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
    markets,
  };
};

export const { Provider: EarnProvider, useContainer: useEarn } =
  createContainer(useEarnInternal);

export const Earn: React.FC = () => {
  return (
    <EarnProvider>
      <EarnInner />
    </EarnProvider>
  );
};
