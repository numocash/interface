import type { IMarket, IMarketUserInfo } from "@dahlia-labs/numoen-utils";
import {
  SliderHandle,
  SliderInput as ReachSlider,
  SliderRange,
  SliderTrack,
} from "@reach/slider";
import { useMemo } from "react";
import tw, { css, styled } from "twin.macro";

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

  const capacity = useMemo(
    () =>
      marketInfo
        ? marketInfo.totalLiquidity.divideBy(market.maxLiquidity)
        : null,
    [market.maxLiquidity, marketInfo]
  );

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

      <div tw="mt-3">
        <SliderInput value={capacity?.asNumber ?? 0} min={0} max={1}>
          <SliderTrack>
            <SliderRange />
            <SliderHandle />
          </SliderTrack>
        </SliderInput>
        <RowBetween tw="px-0">
          <p tw="text-secondary">Capacity</p>
          <p>{capacity?.toSignificant(2)}%</p>
        </RowBetween>
      </div>
    </div>
  );
};

const styledSlider = styled(ReachSlider);

export const SliderInput = styledSlider(
  () => css`
    background: none;

    [data-reach-slider-range] {
      ${tw`h-1 bg-black rounded-r`}
    }

    [data-reach-slider-track] {
      ${tw`h-1 bg-gray-300 rounded`}
    }
  `
);
