import { useMemo } from "react";

import { useEnvironment } from "../../../contexts/environment2";
import { useTrade } from ".";
import { MarketItem } from "./MarketItem";

export const Markets: React.FC = () => {
  const { lendgines } = useTrade();
  const environment = useEnvironment();

  const denomSortedTokens = useMemo(() => {
    const tokens = lendgines.map((m) => [m.token0, m.token1] as const);

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
    lendgines,
  ]);

  return (
    <div tw="flex flex-col gap-2">
      {denomSortedTokens.map((dst, i) => (
        <div key={dst[0].address + dst[1].address} tw="gap-2 flex flex-col">
          {i !== 0 && (
            <div tw="w-full flex justify-self-center border-b-2 border-gray-200" />
          )}
          <MarketItem tokens={dst} />
        </div>
      ))}
    </div>
  );
};
