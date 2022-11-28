import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import { useTrade } from "./useTrade";

export type Trade = {
  zero: boolean;
  inputAmount: TokenAmount;
  outputAmount: TokenAmount;
};

interface UseSwapStateValues {
  market: IMarket;

  setSelectedTo: (token: Token) => void;
  selectedTo: Token;

  typedValue: string;
  setValue: (val: string) => void;

  swapDisabledReason?: string;
  handleTrade: () => Promise<void> | void;
  trade: Trade | null;
}

// for deposits, token amounts must be proportional to the existing liquidity
// for swaps, one of the fields is dependent of the other field
const useArbStateInternal = ({
  market,
}: { market?: IMarket } = {}): UseSwapStateValues => {
  invariant(market);
  const [selectedTo, setSelectedTo] = useState<Token>(market.pair.baseToken);
  const [typedValue, setValue] = useState<string>("");

  const parsedAmount = useMemo(() => {
    const token = market.pair.speculativeToken;
    return TokenAmount.parse(token, typedValue);
  }, [market.pair.speculativeToken, typedValue]);

  const { swapDisabledReason, trade, handleTrade } = useTrade({
    market,
    fromAmount: parsedAmount,
    fromToken: market.pair.speculativeToken,
    toToken: selectedTo,
  });

  return {
    market,
    selectedTo,
    setSelectedTo,

    typedValue: typedValue,
    setValue,

    swapDisabledReason: swapDisabledReason ?? undefined,
    trade,
    handleTrade,
  };
};

export const { useContainer: useArbState, Provider: ArbStateProvider } =
  createContainer(useArbStateInternal);
