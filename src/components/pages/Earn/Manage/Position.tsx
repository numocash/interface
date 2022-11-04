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
import { TokenIcon } from "../../../common/TokenIcon";
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
      <div tw="flex justify-between text-default font-bold text-lg py-4">
        <span tw="flex items-center gap-1">
          {userBaseAmount
            ? userBaseAmount.toFixed(2, { groupSeparator: "," })
            : "--"}{" "}
          <TokenIcon tw="ml-1" token={market.pair.baseToken} size={20} />
          {market.pair.baseToken.symbol.toString()}
        </span>
        <span tw="flex items-center gap-1">
          {userSpeculativeAmount
            ? userSpeculativeAmount.toFixed(2, { groupSeparator: "," })
            : "--"}{" "}
          <TokenIcon tw="ml-1" token={market.pair.speculativeToken} size={20} />
          {market.pair.speculativeToken.symbol.toString()}
        </span>
      </div>
      <hr tw="border-[#AEAEB2] rounded " />
    </Module>
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
