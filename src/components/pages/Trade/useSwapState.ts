import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import type { ParsedQs } from "qs";
import { parse } from "qs";
import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../contexts/environment";
import {
  useEnvironment,
  useGetAddressToMarket,
  useGetSpeculativeToMarket,
} from "../../../contexts/environment";
import { useAddressToToken, useMarketTokens } from "../../../hooks/useTokens";
import { useTrade } from "./useTrade";

export enum Field {
  Input = "INPUT",
  Output = "OUTPUT",
}

export type Trade = {
  mint: boolean;
  market: IMarket;
  inputAmount: TokenAmount;
  outputAmount: TokenAmount;
};

interface UseSwapStateValues {
  onFieldInput: (field: Field, value: string) => void;
  onFieldSelect: (field: Field, token: Token) => void;
  selectedFrom: Token | null;
  selectedTo: Token | null;

  typedValue: string;

  swapDisabledReason?: string;
  handleTrade: () => Promise<void> | void;
  trade: Trade | null;
}

interface SwapFieldState {
  readonly typedValue: string;
  readonly [Field.Input]: {
    readonly token: Token | undefined | null;
  };
  readonly [Field.Output]: {
    readonly token: Token | undefined | null;
  };
}

export const parsedQueryString = (search?: string): ParsedQs => {
  if (!search) {
    const hash = window.location.hash;
    search = hash.slice(hash.indexOf("?"));
  }
  return search && search.length > 1
    ? parse(search, { parseArrays: false, ignoreQueryPrefix: true })
    : {};
};

export const useParsedQueryString = (): ParsedQs => {
  const { search } = useLocation();
  return useMemo(() => parsedQueryString(search), [search]);
};

// for deposits, token amounts must be proportional to the existing liquidity
// for swaps, one of the fields is dependent of the other field
const useSwapStateInternal = (): UseSwapStateValues => {
  const parsedQs = useParsedQueryString();
  const marketTokens = useMarketTokens();

  const { markets } = useEnvironment();
  const marketStart = markets[0];
  invariant(marketStart);

  const getAddressToMarket = useGetAddressToMarket();
  const getSpeculativeToMarket = useGetSpeculativeToMarket();

  const tokenA =
    useAddressToToken(parsedQs.inputToken as string) ??
    marketStart.pair.speculativeToken;

  const tokenB =
    useAddressToToken(parsedQs.outputToken as string) ?? marketStart.token;

  // TODO: consider make form state seralizable (store only token addr)
  const [fieldState, setFieldState] = useState<SwapFieldState>({
    typedValue: "",
    [Field.Input]: {
      token: tokenA,
    },
    [Field.Output]: {
      token: tokenB,
    },
  });

  const inputToken = fieldState[Field.Input].token;

  const selectedFrom = fieldState[Field.Input].token ?? null;
  const selectedTo = fieldState[Field.Output].token ?? null;

  const parsedAmount = useMemo(() => {
    const token = inputToken;
    return token ? TokenAmount.parse(token, fieldState.typedValue) : undefined;
  }, [inputToken, fieldState]);

  const { swapDisabledReason, trade, handleTrade } = useTrade({
    fromAmount: parsedAmount,
    fromToken: selectedFrom ?? parsedAmount?.token ?? undefined,
    toToken: selectedTo ?? undefined,
  });

  const onFieldInput = useCallback(
    (field: Field, value: string) => {
      if (field === Field.Input) {
        setFieldState((prevState) => {
          // estimate output
          return { ...prevState, independentField: field, typedValue: value };
        });
      }
    },
    [setFieldState]
  );

  const onFieldSelect = useCallback(
    (field: Field, token: Token) => {
      const otherField = field === Field.Input ? Field.Output : Field.Input;

      if (fieldState[otherField]?.token?.equals(token)) {
        setFieldState((prevState) => {
          return {
            ...prevState,
            [field]: { token },
            [otherField]: { token: prevState[field].token },
          };
        });
      } else if (marketTokens.includes(token)) {
        const market = getAddressToMarket(token.address);
        invariant(market);
        const speculative = market.pair.speculativeToken;
        setFieldState((prevState) => ({
          ...prevState,
          [field]: { token },
          [otherField]: { token: speculative },
        }));
      } else {
        const market = getSpeculativeToMarket(token);
        invariant(market);
        setFieldState((prevState) => ({
          ...prevState,
          [field]: { token },
          [otherField]: { token: market.token },
        }));
      }
    },
    [fieldState, getAddressToMarket, getSpeculativeToMarket, marketTokens]
  );

  return {
    selectedFrom,
    selectedTo,

    onFieldInput,
    onFieldSelect,

    typedValue: fieldState.typedValue,

    swapDisabledReason: swapDisabledReason ?? undefined,
    trade,
    handleTrade,
  };
};

export const { useContainer: useSwapState, Provider: SwapStateProvider } =
  createContainer(useSwapStateInternal);
