import type { IMarket, IMarketUserInfo } from "@dahlia-labs/numoen-utils";
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

import { useClaimableTokens, useLendgine } from "../../../../hooks/useLendgine";
import { usePair } from "../../../../hooks/usePair";
import { supplyRate } from "../../../../utils/Numoen/jumprate";
import { totalValue } from "../../../../utils/Numoen/priceMath";
import { Module } from "../../../common/Module";
import { TokenIcon } from "../../../common/TokenIcon";

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
    <div tw="rounded-lg bg-black pt-1">
      <Module tw="border-t-0 pb-3">{children}</Module>
    </div>
  ) : (
    <Module tw="pb-3 gap-4 flex flex-col">{children}</Module>
  );
};

export const PositionCard: React.FC<Props> = ({ market, userInfo }: Props) => {
  const { speculativeToken, baseToken } = market.pair;
  const marketInfo = useLendgine(market);
  const pairInfo = usePair(market.pair);

  const tvl = useMemo(
    () =>
      marketInfo && pairInfo ? totalValue(marketInfo, pairInfo, market) : null,
    [market, marketInfo, pairInfo]
  );

  const rate = useMemo(
    () => (marketInfo ? supplyRate(marketInfo) : null),
    [marketInfo]
  );

  const claimableTokens = useClaimableTokens(userInfo?.tokenID, market);

  const hasDeposit = useMemo(() => {
    return (
      (claimableTokens && claimableTokens.greaterThan(0)) ||
      (userInfo && userInfo.liquidity.greaterThan(0))
    );
  }, [claimableTokens, userInfo]);

  return (
    <NavLink
      to={
        userInfo
          ? `/earn/${market.address}/${userInfo.tokenID}`
          : `/earn/${market.address}`
      }
    >
      <Wrapper tw="" hasDeposit={hasDeposit === true}>
        <div tw="flex items-center gap-3">
          <div tw="flex items-center space-x-[-0.5rem]">
            <TokenIcon token={speculativeToken} size={32} />
            <TokenIcon token={baseToken} size={32} />
          </div>
          <div tw="grid gap-0.5">
            <span tw="font-semibold text-lg text-default leading-tight">
              {speculativeToken.symbol} / {baseToken.symbol}
            </span>
          </div>
        </div>
        <div tw="flex flex-col">
          <p tw="text-sm text-secondary">Best APR</p>
          <p tw="text-default font-bold">{rate ? rate.toFixed(1) : "--"}%</p>
        </div>
        <div tw="flex flex-col">
          <p tw="text-sm text-secondary">TVL</p>
          <p tw="text-default font-bold">
            {tvl ? tvl.toFixed(2, { groupSeparator: "," }) : "--"}{" "}
            {market.pair.baseToken.symbol.toString()}
          </p>
        </div>
        {/* <Stats market={market} userInfo={userInfo} /> */}
      </Wrapper>
    </NavLink>
  );
};
