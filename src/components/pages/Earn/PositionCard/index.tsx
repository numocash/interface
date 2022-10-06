import React, { useMemo, useRef, useState } from "react";
import tw, { css, styled } from "twin.macro";

import type {
  IMarket,
  IMarketUserInfo,
} from "../../../../contexts/environment";
import { useLendgine, useTick } from "../../../../hooks/useLendgine";
import { breakpoints } from "../../../../theme/breakpoints";
import { tickToAPR } from "../../../../utils/tick";
import { TokenIcon } from "../../../common/TokenIcon";
import { scale } from "../../Trade/useTrade";
import { PositionCardInner } from "./PositionCardInner";

interface Props {
  market: IMarket;
  userInfo: IMarketUserInfo;
}

export const PositionCard: React.FC<Props> = ({ market, userInfo }: Props) => {
  const { speculativeToken, baseToken } = market.pair;
  const marketInfo = useLendgine(market);
  const tickInfo = useTick(market, userInfo.tick);

  const [isOpen, setOpen] = useState(false);
  const reFocusButtonRef = useRef<HTMLButtonElement>(null);

  const apr = useMemo(
    () =>
      !marketInfo || !tickInfo
        ? null
        : marketInfo.currentTick > userInfo.tick
        ? tickToAPR(userInfo.tick)
        : marketInfo.currentTick === userInfo.tick
        ? (+marketInfo.currentLiquidity
            .divide(tickInfo.liquidity)
            .multiply(100)
            .quotient.toString() *
            tickToAPR(userInfo.tick)) /
          100
        : 0,
    [marketInfo, tickInfo, userInfo.tick]
  );

  const verticalItemAPY = (
    <VerticalItem
      css={css`
        min-width: 75px;
      `}
    >
      <>
        <VerticalItemData>{apr ?? "--"}%</VerticalItemData>
        <VerticalItemLabel>APR</VerticalItemLabel>
      </>
    </VerticalItem>
  );

  const verticalItemDeposit = (
    <VerticalItem
      css={css`
        min-width: 140px;
      `}
      className="noMobile"
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
    <div tw=" overflow-hidden rounded-xl bg-container">
      <div
        role={isOpen ? "expanded" : "closed"}
        tw="px-6 h-[88px] flex justify-between "
        onClick={() => setOpen(!isOpen)}
        onKeyDown={() => setOpen(!isOpen)}
      >
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
        <div tw="flex items-center">
          {verticalItemDeposit}
          {verticalItemAPY}
          <ActualButton
            ref={reFocusButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!isOpen);
            }}
            className={isOpen ? "isOpen" : ""}
          >
            <ActualButtonTriangle
              className={isOpen ? "isOpen" : ""}
            ></ActualButtonTriangle>
          </ActualButton>
        </div>
      </div>
      <Bellows className={isOpen ? "expanded" : "closed"} tabIndex={-1}>
        {isOpen && (
          <PositionCardInner
            userInfo={userInfo}
            market={market}
            isOpen={isOpen}
          />
        )}
      </Bellows>
    </div>
    // <Module tw="flex w-full max-w-2xl pb-0">
    //   <div tw="flex gap-6 flex-col md:flex-row w-full">
    //     <div tw="flex flex-col w-full">
    //       <RowBetween>
    //         <p tw="text-black font-bold text-xl">sq{speculativeToken.symbol}</p>
    //         <p tw="text-black">
    //           Bound: {bound.toFixed(2)} {bound.baseCurrency.symbol} /{" "}
    //           {bound.quoteCurrency.symbol}
    //         </p>
    //       </RowBetween>
    //       <Amounts market={market} />
    //     </div>

    //     <div tw="flex flex-col w-full">
    //       <RowBetween tw="gap-4">
    //         <NavLink tw="w-full" to={"/pool/add-position/" + market.address}>
    //           <Button tw="w-full" variant="primary">
    //             Add
    //           </Button>
    //         </NavLink>
    //         <NavLink tw="w-full" to={"/pool/remove-position/" + market.address}>
    //           <Button tw="w-full" variant="primary">
    //             Remove
    //           </Button>
    //         </NavLink>
    //       </RowBetween>
    //       <Payoff bound={bound} />
    //     </div>
    //   </div>
    // </Module>
  );
};

const ActualButton = styled.button`
  height: 36px;
  width: 36px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.7em;
  color: #667;
  :focus {
  }
  :hover {
    background: rbg(48, 50, 54);
  }
  ${breakpoints.mobile} {
    display: none;
  }
`;
const ActualButtonTriangle = styled.span`
  :after {
    content: "▼";
    display: block;
    transform: rotate(0deg);
    transition: transform 0.3s ease-in-out;
  }
  &.isOpen:after {
    // content: "▲";
    transform: rotate(-180deg);
  }
`;

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

const Bellows = styled.div`
  max-height: 0px;

  margin-top: -4px; // So we can reduce whitespace without affecting the tab outline

  transition: opacity 0.2s ease-in-out, max-height 0.2s ease-out;
  overflow: hidden;

  // So that the tooltips don't get clipped
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;
  opacity: 0;
  &.expanded {
    max-height: 1000px;
    opacity: 1;
  }

  a:focus,
  a:hover {
    text-decoration: underline;
  }
`;
