import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../contexts/environment2";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { Display } from "./Display";
import { Explain } from "./Explain";
import { Filter } from "./Filter";
import { Markets } from "./Markets";
import type { Sorts } from "./Sort";

interface ITrade {
  assets: readonly WrappedTokenInfo[];
  setAssets: (val: readonly WrappedTokenInfo[]) => void;

  sort: keyof typeof Sorts;
  setSort: (val: keyof typeof Sorts) => void;

  markets: readonly (readonly [WrappedTokenInfo, WrappedTokenInfo])[];
}

const useTradeInternal = (): ITrade => {
  const [assets, setAssets] = useState<readonly WrappedTokenInfo[]>([]);
  const [sort, setSort] = useState<keyof typeof Sorts>("default");

  const environment = useEnvironment();
  const lendgines = environment.lendgines;

  const markets = useMemo(() => {
    const lendgineTokens = lendgines.map((m) => [m.token0, m.token1] as const);

    const seen = new Set<string>();

    const dedupedLendgineTokens = lendgineTokens.filter((t) => {
      const sortedTokens = t[0].sortsBefore(t[1])
        ? ([t[0], t[1]] as const)
        : ([t[1], t[0]] as const);
      const tokenID = `${sortedTokens[0].address}_${sortedTokens[1].address}`;
      if (seen.has(tokenID)) {
        return false;
      } else {
        seen.add(tokenID);
        return true;
      }
    });

    const orderedLendginetokens = dedupedLendgineTokens.map((dt) => {
      if (
        dt[0].equals(environment.interface.stablecoin) ||
        dt[1].equals(environment.interface.stablecoin)
      ) {
        return dt[0].equals(environment.interface.stablecoin)
          ? dt
          : ([dt[1], dt[0]] as const);
      }
      return dt[0].equals(environment.interface.wrappedNative)
        ? dt
        : ([dt[1], dt[0]] as const);
    });

    const filteredLendginetokens =
      assets.length === 0
        ? orderedLendginetokens
        : orderedLendginetokens.filter(
            (l) => assets.includes(l[0]) || assets.includes(l[1])
          );

    return filteredLendginetokens;
  }, [
    assets,
    environment.interface.stablecoin,
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
    <div tw="flex flex-col gap-4 w-full max-w-3xl">
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
