import type { Price, Token, TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../../contexts/environment";
import { useCelo, useCusd } from "../../../../hooks/useTokens";
import { Settings } from "../../../common/Settings";
import { SelectPair } from "./SelectPair";
import { SendButton } from "./SendButton";
import { Stats } from "./Stats";

interface ICreatePair {
  speculativeToken: Token | null;
  setSpeculativeToken: (val: Token) => void;

  baseToken: Token | null;
  setBaseToken: (val: Token) => void;

  speculativeTokenAmount: TokenAmount | null;
  setSpeculativeTokenAmount: (val: TokenAmount) => void;

  baseTokenAmount: TokenAmount | null;
  setBaseTokenAmount: (val: TokenAmount) => void;

  bound: Price | null;
}

const useCreatePairInternal = (): ICreatePair => {
  const celo = useCelo();
  const cUSD = useCusd();

  const [speculativeToken, setSpeculativeToken] = useState<Token | null>(celo);
  const [baseToken, setBaseToken] = useState<Token | null>(cUSD);

  const [speculativeTokenAmount, setSpeculativeTokenAmount] =
    useState<TokenAmount | null>(null);

  const [baseTokenAmount, setBaseTokenAmount] = useState<TokenAmount | null>(
    null
  );

  const { markets } = useEnvironment();

  const market = markets[0];
  invariant(market);

  const bound = market.pair.bound;

  return {
    speculativeToken,
    setSpeculativeToken,
    baseToken,
    setBaseToken,
    speculativeTokenAmount,
    setSpeculativeTokenAmount,
    baseTokenAmount,
    setBaseTokenAmount,
    bound,
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
              <p tw="text-default">f-faklfjajifuasfaslk</p>
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
