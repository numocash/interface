import React from "react";
import { NavLink } from "react-router-dom";
import tw, { css, styled } from "twin.macro";

import type {
  IMarket,
  IMarketUserInfo,
} from "../../../../contexts/environment";
import { ChartIcons } from "../../../common/ChartIcons";
import { Module } from "../../../common/Module";
import { TokenIcon } from "../../../common/TokenIcon";
import { scale } from "../../Trade/useTrade";
import { Stats } from "./Stats";

interface Props {
  userInfo: IMarketUserInfo | null;
  market: IMarket;
}

interface WrapperProps {
  hasDeposit: boolean;

  children?: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({
  hasDeposit,
  children,
}: WrapperProps) => {
  return hasDeposit ? (
    <div tw="rounded-lg bg-amber-300 pt-1">
      <Module tw="border-t-0">{children}</Module>
    </div>
  ) : (
    <Module>{children}</Module>
  );
};

export const PositionCard: React.FC<Props> = ({ market, userInfo }: Props) => {
  const { speculativeToken, baseToken } = market.pair;
  // const marketInfo = useLendgine(market);
  // const tickInfo = useTick(market, userInfo.tick);

  const verticalItemDeposit =
    userInfo && userInfo.liquidity.greaterThan(0) ? (
      <VerticalItem
        css={css`
          min-width: 75px;
        `}
      >
        <>
          <VerticalItemData>
            {userInfo.liquidity
              .divide(scale)
              .toFixed(2, { groupSeparator: "," })}{" "}
            {baseToken.symbol}
          </VerticalItemData>
          <VerticalItemLabel>Your Balance</VerticalItemLabel>
        </>
      </VerticalItem>
    ) : null;

  return (
    <NavLink
      to={
        userInfo
          ? `/earn/${market.address}/${userInfo.tokenID}`
          : `/earn/${market.address}`
      }
    >
      <Wrapper hasDeposit={!!userInfo}>
        <div tw="flex justify-between align-top  ">
          <div tw="flex flex-col">
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
          </div>
          <div tw="">{verticalItemDeposit}</div>
        </div>
        <Stats market={market} />
      </Wrapper>
    </NavLink>
  );
};

export const VerticalItem = styled.div`
  ${tw`flex flex-col items-center text-center`}
`;

export const VerticalItemLabel = styled.div`
  text-align: center;
  font-size: 13px;
  ${tw`text-secondary`};
  line-height: 1;
  white-space: nowrap;
  padding-top: 5px;
`;

export const VerticalItemData = styled.div`
  ${tw`flex items-center gap-1 text-default`};
  line-height: 18px;
  font-weight: 600;
`;
