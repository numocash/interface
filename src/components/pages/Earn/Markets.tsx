import { useMemo } from "react";

import { useEnvironment } from "../../../contexts/environment2";
import { MarketItem } from "./MarketItems";

export const Markets: React.FC = () => {
  const environment = useEnvironment();

  const denomSortedTokens = useMemo(() => {
    const tokens = environment.lendgines.map(
      (m) => [m.token0, m.token1] as const
    );

    const seen = new Set<string>();
    const dedupedTokens = tokens.filter((t) => {
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

    return dedupedTokens.map((dt) => {
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
  }, [
    environment.interface.stablecoin,
    environment.interface.wrappedNative,
    environment.lendgines,
  ]);

  return (
    <div tw="grid grid-cols-3 gap-4">
      {denomSortedTokens.map((dst) => (
        <MarketItem tokens={dst} key={`${dst[0].address}/${dst[1].address}`} />
      ))}
    </div>
  );
};
