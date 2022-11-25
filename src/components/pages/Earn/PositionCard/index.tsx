import type { IMarket } from "@dahlia-labs/numoen-utils";
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

import type { IMarketUserInfo } from "../../../../contexts/environment";
import { useLendgine } from "../../../../hooks/useLendgine";
import { ChartIcons } from "../../../common/ChartIcons";
import { Module } from "../../../common/Module";
import { TokenIcon } from "../../../common/TokenIcon";
import { Stats, supplyRate } from "./Stats";

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
      <Module tw="border-t-0 pb-3">{children}</Module>
    </div>
  ) : (
    <Module tw="pb-3">{children}</Module>
  );
};

export const PositionCard: React.FC<Props> = ({ market, userInfo }: Props) => {
  const { speculativeToken, baseToken } = market.pair;
  const marketInfo = useLendgine(market);

  const rate = useMemo(
    () => (marketInfo ? supplyRate(marketInfo) : null),
    [marketInfo]
  );

  const verticalItemAPY = (
    <div tw="flex flex-col items-center text-center">
      <p tw="text-default font-bold">{rate ? rate.toFixed(1) : "--"}%</p>
      <p tw="text-sm text-secondary">APR</p>
    </div>
  );

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
              <div tw="flex items-center space-x-[-0.5rem]">
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
          <div tw="">{verticalItemAPY}</div>
        </div>
        <Stats market={market} userInfo={userInfo} />
      </Wrapper>
    </NavLink>
  );
};
