import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import type { ParsedQs } from "qs";
import { parse } from "qs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createContainer } from "unstated-next";

import { useAddressToToken, useCusd } from "../../../hooks/useTokens";
import { useTrade } from "./useTrade";

export enum Field {
  Input = "INPUT",
  Output = "OUTPUT",
}

export type Trade = {
  input: TokenAmount;
  output: TokenAmount;
  fee: TokenAmount;
  minimumOutput: TokenAmount;
};

interface UseSwapStateValues {
  onFieldInput: (field: Field, value: string) => void;
  onFieldSelect: (field: Field, token: Token) => void;
  selectedFrom: Token | null;
  selectedTo: Token | null;

  invertSwap: () => void;
  typedValue: string;
  independentField: Field;
  dependentField: Field;

  swapDisabledReason?: string;
  handleTrade: () => void;
  trade: Trade | null;

  parsedAmounts: { [field in Field]: TokenAmount | undefined };
}

interface SwapFieldState {
  readonly independentField: Field;
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
  const cusd = useCusd();

  const defaultSwapToken = cusd;

  const tokenA =
    useAddressToToken(parsedQs.inputToken as string) ??
    defaultSwapToken ??
    undefined;

  const tokenB = useAddressToToken(parsedQs.outputToken as string) ?? undefined;

  // TODO: consider make form state seralizable (store only token addr)
  const [fieldState, setFieldState] = useState<SwapFieldState>({
    independentField: Field.Input,
    typedValue: "",
    [Field.Input]: {
      token: null,
    },
    [Field.Output]: {
      token: null,
    },
  });

  const inputToken = fieldState[Field.Input].token;
  const outputToken = fieldState[Field.Output].token;
  const independentField = fieldState.independentField;
  const dependentField =
    fieldState.independentField === Field.Input ? Field.Output : Field.Input;

  useEffect(() => {
    const parsedOutputToken = tokenB ?? undefined;
    const parsedInputToken = tokenA ?? undefined;

    setFieldState((p) => ({
      ...p,
      [Field.Input]: { token: parsedInputToken },
      [Field.Output]: { token: parsedOutputToken },
    }));
  }, [tokenA, tokenB]);

  const selectedFrom = fieldState[Field.Input].token ?? null;
  const selectedTo = fieldState[Field.Output].token ?? null;

  const isExactIn: boolean = independentField === Field.Input;
  const parsedAmount = useMemo(() => {
    const token = isExactIn ? inputToken : outputToken;
    return token ? TokenAmount.parse(token, fieldState.typedValue) : undefined;
  }, [isExactIn, inputToken, outputToken, fieldState]);

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

  const parsedAmounts = useMemo(
    () => ({
      [Field.Input]:
        independentField === Field.Input ? parsedAmount : trade?.input,
      [Field.Output]:
        independentField === Field.Output ? parsedAmount : trade?.output,
    }),
    [independentField, parsedAmount, trade]
  );

  const invertSwap = useCallback(() => {
    setFieldState((prevState) => {
      const typedValue = parsedAmounts[Field.Output]?.toExact() ?? "";

      return {
        ...prevState,
        typedValue,
        [Field.Input]: { token: prevState[Field.Output].token },
        [Field.Output]: { token: prevState[Field.Input].token },
      };
    });
  }, [setFieldState, parsedAmounts]);

  return {
    selectedFrom,
    selectedTo,
    parsedAmounts,

    invertSwap,
    onFieldInput,
    onFieldSelect,

    dependentField,
    independentField,
    typedValue: fieldState.typedValue,

    swapDisabledReason: swapDisabledReason ?? undefined,
    trade,
    handleTrade,
  };
};

export const { useContainer: useSwapState, Provider: SwapStateProvider } =
  createContainer(useSwapStateInternal);
