import type { IMarket } from "@dahlia-labs/numoen-utils";
import { Price } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";

import { usePair } from "../../../hooks/usePair";
import { useUniswapPair } from "../../../hooks/useUniswapPair";
import { scaleFactor } from "../../../utils/Numoen/invariantMath";
import { pairInfoToPrice } from "../../../utils/Numoen/priceMath";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { Module } from "../../common/Module";
import { RowBetween } from "../../common/RowBetween";
import { TokenIcon } from "../../common/TokenIcon";
import { scale } from "../TradeOld/useTrade";

interface Props {
  market: IMarket;
}

export const ArbCard: React.FC<Props> = ({ market }: Props) => {
  const pairInfo = usePair(market.pair);
  const uniInfo = useUniswapPair(market);

  const numoenPrice = useMemo(
    () => (pairInfo ? pairInfoToPrice(pairInfo, market.pair) : null),
    [market.pair, pairInfo]
  );

  const uniPrice = useMemo(
    () =>
      uniInfo
        ? new Price(
            market.pair.speculativeToken,
            market.pair.baseToken,
            JSBI.divide(
              JSBI.multiply(uniInfo[1].raw, scale.quotient),
              scaleFactor(market.pair.speculativeScaleFactor)
            ),
            JSBI.divide(
              JSBI.multiply(uniInfo[0].raw, scale.quotient),
              scaleFactor(market.pair.baseScaleFactor)
            )
          )
        : null,
    [
      market.pair.baseScaleFactor,
      market.pair.baseToken,
      market.pair.speculativeScaleFactor,
      market.pair.speculativeToken,
      uniInfo,
    ]
  );

  return (
    <NavLink to={`/arb/${market.address}`}>
      <Module tw="w-full">
        <div tw="flex flex-col">
          <div tw="flex items-center gap-3">
            <div tw="flex items-center space-x-[-0.5rem]">
              <TokenIcon token={market.pair.speculativeToken} size={32} />
              <TokenIcon token={market.pair.baseToken} size={32} />
            </div>
            <div tw="grid gap-0.5">
              <span tw="font-semibold text-lg text-default leading-tight">
                {market.pair.speculativeToken.symbol} /{" "}
                {market.pair.baseToken.symbol}
              </span>
            </div>
          </div>
          <RowBetween>
            <p>Numoen Price: </p>
            <p>
              {numoenPrice ? (
                numoenPrice.asFraction.toSignificant(6)
              ) : (
                <LoadingSpinner />
              )}
            </p>
          </RowBetween>
          <RowBetween>
            <p>Uniswap Price: </p>
            <p>
              {uniPrice ? (
                uniPrice.asFraction.toSignificant(6)
              ) : (
                <LoadingSpinner />
              )}
            </p>
          </RowBetween>
        </div>
      </Module>
    </NavLink>
  );
};
