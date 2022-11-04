import { Percent, TokenAmount } from "@dahlia-labs/token-utils";
import {
  SliderHandle,
  SliderInput as ReachSlider,
  SliderRange,
  SliderTrack,
} from "@reach/slider";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import tw, { css, styled } from "twin.macro";

import { useUserLendgine } from "../../../../hooks/useLendgine";
import { usePair } from "../../../../hooks/usePair";
import { Module } from "../../../common/Module";
import { pairInfoToPrice } from "../PositionCard/Stats";
import { useManage } from ".";

export const Position: React.FC = () => {
  const { market, tokenID } = useManage();
  invariant(tokenID, "tokenID missing");
  const userLendgineInfo = useUserLendgine(tokenID, market);

  const pairInfo = usePair(market.pair);

  const { userBaseAmount, userSpeculativeAmount } = useMemo(() => {
    if (pairInfo && pairInfo.totalLPSupply.equalTo(0))
      return {
        userBaseAmount: new TokenAmount(market.pair.baseToken, 0),
        userSpeculativeAmount: new TokenAmount(market.pair.speculativeToken, 0),
      };
    const userBaseAmount =
      userLendgineInfo && pairInfo
        ? pairInfo.baseAmount
            .multiply(userLendgineInfo.liquidity)
            .divide(pairInfo.totalLPSupply)
        : null;
    const userSpeculativeAmount =
      userLendgineInfo && pairInfo
        ? pairInfo.speculativeAmount
            .multiply(userLendgineInfo.liquidity)
            .divide(pairInfo.totalLPSupply)
        : null;
    return { userBaseAmount, userSpeculativeAmount };
  }, [
    market.pair.baseToken,
    market.pair.speculativeToken,
    pairInfo,
    userLendgineInfo,
  ]);

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
        <p>
          {userBaseAmount
            ? userBaseAmount.toFixed(2, { groupSeparator: "," })
            : "--"}{" "}
          {market.pair.baseToken.symbol.toString()}
        </p>
        <p>
          {userSpeculativeAmount
            ? userSpeculativeAmount.toFixed(2, { groupSeparator: "," })
            : "--"}{" "}
          {market.pair.speculativeToken.symbol.toString()}
        </p>
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
