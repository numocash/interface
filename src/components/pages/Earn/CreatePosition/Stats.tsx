import { Percent } from "@dahlia-labs/token-utils";
import { useMemo } from "react";

import { useLendgine } from "../../../../hooks/useLendgine";
import { usePair } from "../../../../hooks/usePair";
import { ShareMetric } from "../../../common/ShareMetric";
import { TokenIcon } from "../../../common/TokenIcon";
import { useCreatePair } from ".";

export const Stats: React.FC = () => {
  const { market } = useCreatePair();

  const lendgineInfo = useLendgine(market);
  const pairInfo = usePair(market.pair);

  const rate = useMemo(
    () =>
      lendgineInfo && !lendgineInfo.totalLiquidityBorrowed.equalTo(0)
        ? new Percent(
            lendgineInfo.interestNumerator.quotient,
            lendgineInfo.totalLiquidityBorrowed.quotient
          )
        : null,
    [lendgineInfo]
  );

  const apr = (
    <ShareMetric
      title="APR"
      value={
        <div tw="grid gap-4">
          <div tw="text-xl text-black">{!rate ? 0 : rate.toFixed(2)}%</div>
        </div>
      }
    />
  );

  return (
    <div tw="grid gap-8 md:gap-4 md:grid-cols-3 pb-9 px-6 pt-3">
      {apr}
      <ShareMetric
        title="Total Supply"
        value={
          <div tw="flex items-center">
            <div tw="flex-col flex gap-1">
              <div tw="flex flex-row items-center gap-1 text-black">
                <TokenIcon token={market.pair.speculativeToken} />
                {pairInfo?.speculativeAmount.toFixed(2, {
                  groupSeparator: ",",
                }) ?? "--"}
                <div>{market.pair.speculativeToken.symbol}</div>
              </div>{" "}
              <div tw="flex flex-row items-center gap-1 text-black">
                <TokenIcon token={market.pair.baseToken} />
                {pairInfo?.baseAmount.toFixed(2, {
                  groupSeparator: ",",
                }) ?? "--"}
                <div>{market.pair.baseToken.symbol}</div>
              </div>
            </div>
          </div>
        }
      />
      <ShareMetric
        title="Upper Bound"
        value={
          <div tw="h-7 flex items-center text-black">
            {market.pair.bound.toFixed(2, { groupSeparator: "," })}{" "}
            {market.pair.baseToken.symbol} /{" "}
            {market.pair.speculativeToken.symbol}
          </div>
        }
      />
    </div>
  );
};
