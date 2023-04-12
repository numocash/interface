import type { CurrencyAmount } from "@uniswap/sdk-core";
import { useState } from "react";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import { useAllLendgines } from "../../../hooks/useAllLendgines";
import type { Lendgine } from "../../../lib/types/lendgine";
import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import { LoadingPage } from "../../common/LoadingPage";
import { TradeInner } from "./TradeInner";

interface ITrade {
  token0: WrappedTokenInfo | undefined;
  setToken0: (val: WrappedTokenInfo) => void;

  token1: WrappedTokenInfo | undefined;
  setToken1: (val: WrappedTokenInfo) => void;

  input: CurrencyAmount<WrappedTokenInfo> | undefined;
  setInput: (val: CurrencyAmount<WrappedTokenInfo>) => void;

  lendgine: Lendgine | undefined;
  setLendgine: (val: Lendgine) => void;

  lendgines: readonly Lendgine[];
}

const useTradeInternal = ({
  lendgines,
}: {
  lendgines?: readonly Lendgine[] | undefined;
} = {}): ITrade => {
  invariant(lendgines);

  const [token0, setToken0] = useState<WrappedTokenInfo | undefined>(undefined);
  const [token1, setToken1] = useState<WrappedTokenInfo | undefined>(undefined);
  const [input, setInput] = useState<
    CurrencyAmount<WrappedTokenInfo> | undefined
  >(undefined);
  const [lendgine, setLendgine] = useState<Lendgine | undefined>(undefined);

  return {
    token0,
    setToken0,
    token1,
    setToken1,
    input,
    setInput,
    lendgine,
    setLendgine,
    lendgines,
  };
};

export const { Provider: TradeProvider, useContainer: useTrade } =
  createContainer(useTradeInternal);

export const Trade: React.FC = () => {
  const lendginesQuery = useAllLendgines();

  return lendginesQuery.status !== "success" ? (
    <LoadingPage />
  ) : (
    <TradeProvider initialState={{ lendgines: lendginesQuery.lendgines }}>
      <TradeInner />
    </TradeProvider>
  );
};
