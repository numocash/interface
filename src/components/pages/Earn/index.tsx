import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { useAllLendgines } from "../../../hooks/useAllLendgines";
import { lendgineToMarket } from "../../../lib/lendgineValidity";
import type { Market } from "../../../lib/types/market";
import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import { dedupe } from "../../../utils/dedupe";
import { EarnInner } from "./EarnInner";

interface IEarn {
  assets: readonly WrappedTokenInfo[];
  setAssets: (val: readonly WrappedTokenInfo[]) => void;

  markets: readonly Market[] | null;
}

const useEarnInternal = (): IEarn => {
  const [assets, setAssets] = useState<readonly WrappedTokenInfo[]>([]);

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

    const dedupedMarkets = dedupe(
      markets,
      (m) => m.base.address + m.quote.address
    );

    const filteredMarkets =
      assets.length === 0
        ? dedupedMarkets
        : dedupedMarkets.filter(
            (m) =>
              !!assets.find((a) => a.equals(m.base)) ||
              !!assets.find((a) => a.equals(m.quote))
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
