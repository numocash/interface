import type { TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../../contexts/environment";
import { useEnvironment } from "../../../../contexts/environment";
import { Settings } from "../../../common/Settings";
import { SelectPair } from "./SelectPair";
import { SendButton } from "./SendButton";
import { Stats } from "./Stats";

interface ICreatePair {
  market: IMarket;

  speculativeTokenAmount: TokenAmount | null;
  setSpeculativeTokenAmount: (val: TokenAmount) => void;

  baseTokenAmount: TokenAmount | null;
  setBaseTokenAmount: (val: TokenAmount) => void;

  tick: number;
  setTick: (val: number) => void;
}

const useCreatePairInternal = (): ICreatePair => {
  const [speculativeTokenAmount, setSpeculativeTokenAmount] =
    useState<TokenAmount | null>(null);

  const [baseTokenAmount, setBaseTokenAmount] = useState<TokenAmount | null>(
    null
  );

  const [tick, setTick] = useState(5);

  const { markets } = useEnvironment();

  const market = markets[0];
  invariant(market);

  return {
    market: market,
    speculativeTokenAmount,
    setSpeculativeTokenAmount,
    baseTokenAmount,
    setBaseTokenAmount,
    tick,
    setTick,
  };
};

export const { Provider: CreatePairProvider, useContainer: useCreatePair } =
  createContainer(useCreatePairInternal);

export const CreatePosition: React.FC = () => {
  return (
    <div tw="flex flex-col gap-3 max-w-xl w-full">
      <CreatePairProvider>
        <div tw="rounded-xl overflow-hidden bg-white shadow-2xl">
          <div tw="flex items-center justify-between mb-4 h-[68px] py-3 px-6 bg-[#EDEEEF]">
            <NavLink to={`/earn`} tw="flex items-center text-xl text-black">
              <FaChevronLeft />
            </NavLink>
            <p tw="text-default font-semibold text-xl">Add Liquidity</p>
            <Settings tw="hidden" />
          </div>
          <Stats />
        </div>
        <div tw="rounded-xl overflow-hidden bg-white shadow-2xl">
          <div tw="px-6 h-[88px] flex py-3  flex-col justify-between bg-[#EDEEEF]">
            <>
              <p tw="text-xl font-semibold text-black">
                Select tokens and amounts
              </p>
              <p tw="text-default">
                Provide two-token liquidity and get an LP share.
              </p>
            </>
          </div>
          <SelectPair />
        </div>
        <div tw="flex justify-center">
          <SendButton tw="flex justify-center items-center" />
        </div>
      </CreatePairProvider>
    </div>
  );
};
