import { useMemo } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { NavLink } from "react-router-dom";

import { useLendgine } from "../../../../hooks/useLendgine";
import { ChartIcons } from "../../../common/ChartIcons";
import { TokenIcon } from "../../../common/TokenIcon";
import { Stats, supplyRate } from "../PositionCard/Stats";
import { useManage } from ".";

export const Top: React.FC = () => {
  const { market } = useManage();
  const marketInfo = useLendgine(market);

  const rate = useMemo(
    () => (marketInfo ? supplyRate(marketInfo) : null),
    [marketInfo]
  );
  return (
    <>
      <NavLink to={`/earn`} tw="flex items-center text-xl text-black">
        <FaChevronLeft />
      </NavLink>

      <div tw="p-6 pb-3 rounded-lg bg-action border border-[#AEAEB2] ">
        <div tw="flex justify-between align-top">
          <div tw="flex items-center gap-3">
            <div tw="flex items-center space-x-[-0.5rem]">
              <TokenIcon token={market.pair.speculativeToken} size={24} />
              <TokenIcon token={market.pair.baseToken} size={24} />
            </div>
            <div tw="grid gap-0.5">
              <span tw="font-semibold text-xl text-default leading-tight">
                {market.pair.speculativeToken.symbol} /{" "}
                {market.pair.baseToken.symbol}
              </span>
            </div>
          </div>
          <div tw="flex flex-col items-center text-center">
            <p tw="text-default text-lg font-bold">
              {rate ? rate.toFixed(1) : "--"}%
            </p>
            <p tw="text-sm text-secondary">APR</p>
          </div>
        </div>
        <div tw="flex w-auto gap-2 pb-2">
          {market.pair.speculativeToken.address <
          market.pair.baseToken.address ? (
            <>
              <ChartIcons chart="up" token={market.pair.speculativeToken} />
              <ChartIcons chart="down" token={market.pair.baseToken} />
            </>
          ) : (
            <>
              <ChartIcons chart="down" token={market.pair.baseToken} />
              <ChartIcons chart="up" token={market.pair.speculativeToken} />
            </>
          )}
        </div>

        <div tw="">
          <Stats market={market} userInfo={null} />
        </div>
      </div>
    </>
  );
};
