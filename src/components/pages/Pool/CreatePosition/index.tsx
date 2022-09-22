import type { Price, Token, TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import { useEnvironment } from "../../../../contexts/environment";
import { useCelo, useCusd } from "../../../../hooks/useTokens";
import { Review } from "./Review";
import { SelectPair } from "./SelectPair";
import { SendButton } from "./SendButton";

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
    <div tw="flex flex-col gap-3 max-w-2xl w-full">
      <NavLink to={`/pool`} tw="flex items-center text-xs">
        <div tw="text-xs flex gap-1.5 items-center text-default ">
          <FaChevronLeft />
          Back to pool list
        </div>
      </NavLink>
      <CreatePairProvider>
        <SelectPair />
        <Review />
        <SendButton />
      </CreatePairProvider>
    </div>
  );
};
