import { useMemo } from "react";

import { ModelMarket } from "../../../contexts/environment";
import { useGetSortDenomTokens } from "../../../hooks/useTokens";
import { sortTokens } from "../../../hooks/useUniswapPair";
import { MarketItem } from "./MarketItem";

export const Markets: React.FC = () => {
  // Load markets
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const markets = [ModelMarket] as const;
  const getDenomSortedTokens = useGetSortDenomTokens();

  const denomSortedTokens = useMemo(() => {
    const tokens = markets.map(
      (m) => [m.pair.baseToken, m.pair.speculativeToken] as const
    );

    const seen = new Set<string>();
    const dedupedTokens = tokens.filter((t) => {
      const sortedTokens = sortTokens(t);
      const tokenID = `${sortedTokens[0].address}_${sortedTokens[1].address}`;
      if (seen.has(tokenID)) {
        return false;
      } else {
        seen.add(tokenID);
        return true;
      }
    });

    return dedupedTokens.map((dt) => getDenomSortedTokens(dt));
  }, [getDenomSortedTokens, markets]);

  return (
    <div tw="flex flex-col gap-2">
      {denomSortedTokens.map((dst) => (
        <MarketItem tokens={dst} key={dst.denom.address + dst.other.address} />
      ))}
    </div>
  );
};
