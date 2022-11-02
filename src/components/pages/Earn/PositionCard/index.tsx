import React from "react";
import { NavLink } from "react-router-dom";
import tw, { css, styled } from "twin.macro";

import type {
  IMarket,
  IMarketUserInfo,
} from "../../../../contexts/environment";
import { breakpoints } from "../../../../theme/breakpoints";
import { ChartIcons } from "../../../common/ChartIcons";
import { TokenIcon } from "../../../common/TokenIcon";
import { scale } from "../../Trade/useTrade";
import { Stats } from "./Stats";

interface Props {
  market: IMarket;
  userInfo: IMarketUserInfo;
}

export const PositionCard: React.FC<Props> = ({ market, userInfo }: Props) => {
  const { speculativeToken, baseToken } = market.pair;
  // const marketInfo = useLendgine(market);
  // const tickInfo = useTick(market, userInfo.tick);

  const verticalItemDeposit = (
    <VerticalItem
      css={css`
        min-width: 75px;
      `}
    >
      <>
        <VerticalItemData>
          {userInfo.liquidity.divide(scale).toFixed(2, { groupSeparator: "," })}{" "}
          {baseToken.symbol}
        </VerticalItemData>
        <VerticalItemLabel>Your Balance</VerticalItemLabel>
      </>
    </VerticalItem>
  );

  return (
    <NavLink to={`/earn/${market.address}`}>
      <div tw="p-4 rounded-xl bg-action flex flex-col hover:border-container border border-action">
        <div tw="flex justify-between items-center">
          <div tw="flex items-center gap-3">
            <div tw="flex items-center space-x--2">
              <TokenIcon token={speculativeToken} size={24} />
              <TokenIcon token={baseToken} size={24} />
            </div>
            <div tw="grid gap-0.5">
              <span tw="font-semibold text-lg text-default leading-tight">
                {speculativeToken.symbol} / {baseToken.symbol}
              </span>
            </div>
          </div>
          <div tw="flex items-center">{verticalItemDeposit}</div>
        </div>
        <div tw="flex w-auto gap-2">
          <ChartIcons chart="up" token={market.pair.speculativeToken} />
          <ChartIcons chart="down" token={market.pair.baseToken} />
        </div>
        <Stats />
      </div>
    </NavLink>
  );
};

export const VerticalItem = styled.div`
  ${tw`flex flex-col items-center text-center`}

  ${breakpoints.tablet} {
    &.noTablet {
      display: none;
    }
  }
`;

export const VerticalItemLabel = styled.div`
  text-align: center;
  font-size: 13px;
  ${tw`text-secondary`};
  line-height: 1;
  white-space: nowrap;
  padding-top: 5px;
  padding-bottom: 8px;
`;

export const VerticalItemData = styled.div`
  ${tw`flex items-center gap-1 text-default`};
  line-height: 18px;
  font-weight: 600;
  padding-top: 8px;
`;
