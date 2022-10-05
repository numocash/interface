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
  useAddressToToken,
  useCelo,
  useMarketTokens,
} from "../../../hooks/useTokens";
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
  baseAmount: TokenAmount;
};

interface UseSwapStateValues {
  onFieldInput: (field: Field, value: string) => void;
  onFieldSelect: (field: Field, token: Token) => void;
  selectedFrom: Token | null;
  selectedTo: Token | null;

  invertSwap: () => void;
  typedValue: string;

  swapDisabledReason?: string;
  handleTrade: () => Promise<void>;
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
  const celo = useCelo();
  const marketTokens = useMarketTokens();
  const marketToken = useMemo(() => marketTokens[0], [marketTokens]);
  invariant(marketToken);

  const tokenA = useAddressToToken(parsedQs.inputToken as string) ?? celo;

  const tokenB =
    useAddressToToken(parsedQs.outputToken as string) ?? marketToken;

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
  const outputToken = fieldState[Field.Output].token;

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
          // TODO: support exactOut
          return { ...prevState, independentField: field, typedValue: value };
        });
      }
    },
    [setFieldState]
  );

  // changing the token doesn't affect if
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
      } else {
        setFieldState((prevState) => ({ ...prevState, [field]: { token } }));
      }
    },
    [setFieldState, fieldState]
  );

  const invertSwap = useCallback(() => {
    setFieldState((prevState) => {
      return {
        ...prevState,
        [Field.Input]: { token: prevState[Field.Output].token },
        [Field.Output]: { token: prevState[Field.Input].token },
      };
    });
  }, [setFieldState]);

  return {
    selectedFrom,
    selectedTo,

    invertSwap,
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
