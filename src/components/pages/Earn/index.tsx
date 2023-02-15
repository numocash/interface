import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../contexts/environment2";
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

  markets: readonly Market[];
}

const useEarnInternal = (): IEarn => {
  const [assets, setAssets] = useState<readonly WrappedTokenInfo[]>([]);

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
