import { useMemo } from "react";

import { useTrade } from ".";

export const Display: React.FC = () => {
  const { lendgines } = useTrade();

  const numMarkets = useMemo(() => {
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
    return dedupedTokens.length;
  }, [lendgines]);

  return (
    <p tw="text-xs text-default">
      Displaying{" "}
      <span tw="font-semibold">
        {numMarkets} market{numMarkets !== 1 ? "s" : ""}
      </span>
    </p>
  );
};
