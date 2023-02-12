import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../contexts/environment2";
import type { Market } from "../../../hooks/useMarket";
import {
  dedupeMarkets,
  useGetLendgineToMarket,
} from "../../../hooks/useMarket";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { Button } from "../../common/Button";
import { Display } from "../../common/Display";
import { Filter } from "../../common/Filter";
import { Explain } from "./Explain";
import { Markets } from "./Markets";

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
  const { markets, assets, setAssets } = useEarnInternal();
  return (
    <EarnProvider>
      <div tw="grid w-full max-w-4xl flex-col gap-4">
        <Explain />
        <Display numMarkets={markets.length} />
        <div tw="flex w-full justify-between gap-4">
          <Filter assets={assets} setAssets={setAssets} />
          {/* <Sort /> */}
          <NavLink to="/create/">
            <Button tw="h-12 text-lg" variant="primary">
              Create new market
            </Button>
          </NavLink>
        </div>
        <Markets />
      </div>
    </EarnProvider>
  );
};
