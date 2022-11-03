import { Percent } from "@dahlia-labs/token-utils";
import {
  SliderHandle,
  SliderInput as ReachSlider,
  SliderRange,
  SliderTrack,
} from "@reach/slider";
import { useMemo } from "react";
import tw, { css, styled } from "twin.macro";

import { usePair } from "../../../../hooks/usePair";
import { Module } from "../../../common/Module";
import { pairInfoToPrice } from "../PositionCard/Stats";
import { useManage } from ".";

export const Position: React.FC = () => {
  const { market } = useManage();

  const pairInfo = usePair(market.pair);

  const proportion = useMemo(() => {
    const price = pairInfo ? pairInfoToPrice(pairInfo, market.pair) : null;
    if (price?.equalTo(0)) return null;

    const speculativeValue =
      price && pairInfo ? price.quote(pairInfo.speculativeAmount) : null;
    return pairInfo && speculativeValue
      ? Percent.fromFraction(
          pairInfo.baseAmount.divide(pairInfo.baseAmount.add(speculativeValue))
        )
      : null;
  }, [market.pair, pairInfo]);

  return (
    <Module tw="">
      <p tw="font-bold text-default text-xl">Your Deposits</p>
      <div tw="mt-6">
        <SliderInput
          value={proportion ? proportion.asNumber : 0.5}
          min={0}
          max={1}
        >
          <SliderTrack>
            <SliderRange />
            <SliderHandle />
          </SliderTrack>
        </SliderInput>
      </div>
      <div tw="flex justify-between text-default font-bold text-lg mt-2">
        <p>{10.03} cUSD</p>
        <p>{3.9} CELO</p>
      </div>
    </Module>
  );
};

const styledSlider = styled(ReachSlider);

export const SliderInput = styledSlider(
  () => css`
    background: none;

    [data-reach-slider-range] {
      ${tw`h-1 rounded-r bg-amber-500`}
    }

    [data-reach-slider-track] {
      ${tw`h-1 bg-blue-500 rounded`}
    }
  `
);
