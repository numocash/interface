import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import type { ParsedQs } from "qs";
import { parse } from "qs";
import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import {
  useAddressToMarket,
  useEnvironment,
  useGetAddressToMarket,
  useGetSpeculativeToMarket,
} from "../../../contexts/environment";
import { useAddressToToken, useMarketTokens } from "../../../hooks/useTokens";
import { useBurn, useMint } from "./useTrade";

export enum Field {
  Input = "INPUT",
  Output = "OUTPUT",
}

export type Trade = {
  mint: boolean;
  market: IMarket;
  inputAmount: TokenAmount;
  outputAmount: TokenAmount;
  disableReason: string | null;
  callback: () => Promise<void>;
};

interface UseSwapStateValues {
  onFieldInput: (field: Field, value: string) => void;
  onFieldSelect: (field: Field, token: Token) => void;
  selectedFrom: Token;
  selectedTo: Token;

  typedValue: string;

  trade: Trade | null;
}

interface SwapFieldState {
  readonly typedValue: string;
  readonly [Field.Input]: {
    readonly token: Token;
  };
  readonly [Field.Output]: {
    readonly token: Token;
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
  const marketStart = markets[markets.length - 1];
  invariant(marketStart, "start market");

  const getAddressToMarket = useGetAddressToMarket();
  const getSpeculativeToMarket = useGetSpeculativeToMarket();

  const tokenA =
    useAddressToToken(parsedQs.inputToken as string) ??
    marketStart.pair.speculativeToken;

  const tokenB =
    useAddressToToken(parsedQs.outputToken as string) ?? marketStart.token;

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

  const parsedAmount = useMemo(() => {
    const token = inputToken;
    return TokenAmount.parse(token, fieldState.typedValue);
  }, [inputToken, fieldState]);

  const market0 = useAddressToMarket(inputToken.address);
  const market1 = useAddressToMarket(outputToken.address);

  const mint = !market0;
  const market = market0 ?? market1;
  invariant(market);

  const mintOut = useMint(parsedAmount, market);
  const burnOut = useBurn(parsedAmount, market);

  const trade = useMemo(
    () =>
      mint
        ? mintOut
          ? {
              mint,
              market,
              inputAmount: parsedAmount,
              outputAmount: mintOut.outputAmount,
              callback: mintOut.callback,
              disableReason: mintOut.disableReason,
            }
          : null
        : burnOut
        ? {
            mint,
            market,
            inputAmount: parsedAmount,
            outputAmount: burnOut.outputAmount,
            callback: burnOut.callback,
            disableReason: burnOut.disableReason,
          }
        : null,
    [burnOut, market, mint, mintOut, parsedAmount]
  );

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
    selectedFrom: inputToken,
    selectedTo: outputToken,

    onFieldInput,
    onFieldSelect,

    typedValue: fieldState.typedValue,

    trade,
  };
};

export const { useContainer: useSwapState, Provider: SwapStateProvider } =
  createContainer(useSwapStateInternal);
