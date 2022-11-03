import { FaChevronLeft } from "react-icons/fa";
import { NavLink } from "react-router-dom";

import { ChartIcons } from "../../../common/ChartIcons";
import { Settings } from "../../../common/Settings";
import { TokenIcon } from "../../../common/TokenIcon";
import { Stats } from "../PositionCard/Stats";
import { useManage } from ".";

export const Top: React.FC = () => {
  const { market } = useManage();
  return (
    <>
      <NavLink to={`/earn`} tw="flex items-center text-xl text-black">
        <FaChevronLeft />
      </NavLink>
      <div tw="p-6 pb-3 rounded-lg bg-action border border-[#AEAEB2]">
        <div tw="flex items-center justify-between ">
          <div tw="flex items-center gap-3">
            <div tw="flex items-center space-x--2">
              <TokenIcon token={market.pair.speculativeToken} size={24} />
              <TokenIcon token={market.pair.baseToken} size={24} />
            </div>
            <div tw="grid gap-0.5">
              <span tw="font-semibold text-lg text-default leading-tight">
                {market.pair.speculativeToken.symbol} /{" "}
                {market.pair.baseToken.symbol}
              </span>
            </div>
          </div>
          <Settings tw="hidden" />
        </div>
        <div tw="flex w-auto gap-2 py-2">
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
          <Stats market={market} />
        </div>
      </div>
    </>
  );
};
