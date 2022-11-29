import type { IMarket, IMarketUserInfo } from "@dahlia-labs/numoen-utils";
import { useMemo } from "react";

import { useLendgine } from "../../../../hooks/useLendgine";
import { usePair } from "../../../../hooks/usePair";
import { totalValue } from "../../../../utils/Numoen/priceMath";
import { RowBetween } from "../../../common/RowBetween";

interface Props {
  market: IMarket;
  userInfo: IMarketUserInfo | null;
}

export const Stats: React.FC<Props> = ({ market, userInfo }: Props) => {
  const marketInfo = useLendgine(market);
  const pairInfo = usePair(market.pair);

  const tvl = useMemo(
    () =>
      marketInfo && pairInfo ? totalValue(marketInfo, pairInfo, market) : null,
    [market, marketInfo, pairInfo]
  );

  return (
    <div tw="">
      {userInfo && userInfo.liquidity.greaterThan(0) && (
        <>
          <RowBetween tw="">
            <p tw="text-default">Your deposit</p>
            <p tw="text-default font-semibold">
              {tvl && marketInfo
                ? tvl
                    .scale(userInfo.liquidity.divide(marketInfo.totalLiquidity))
                    .toFixed(2, { groupSeparator: "," })
                : "--"}{" "}
              {market.pair.baseToken.symbol}
            </p>
          </RowBetween>
          <hr tw="border-[#AEAEB2] rounded " />
        </>
      )}
      <RowBetween>
        <p tw="text-default">TVL</p>
        <p tw="text-default font-semibold">
          {tvl ? tvl.toFixed(2, { groupSeparator: "," }) : "--"}{" "}
          {market.pair.baseToken.symbol.toString()}
        </p>
      </RowBetween>
    </div>
  );
};
