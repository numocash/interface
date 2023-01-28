import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { useEnvironment } from "../../../contexts/environment2";
import { useFactory } from "../../../hooks/useContract";
import {
  useCurrentPrice,
  useMostLiquidMarket,
} from "../../../hooks/useExternalExchange";
import { useDefaultTokenList, useMarketToken } from "../../../hooks/useTokens2";
import { sortTokens } from "../../../hooks/useUniswapPair";
import { useBeet } from "../../../utils/beet";
import { AsyncButton } from "../../common/AsyncButton";
import { BigNumericInput } from "../../common/inputs/BigNumericInput";
import { RowBetween } from "../../common/RowBetween";
import { TokenSelection } from "../../common/TokenSelection";

export const Create: React.FC = () => {
  const Beet = useBeet();
  const [specToken, setSpecToken] = useState<Token | undefined>(undefined);
  const [baseToken, setBaseToken] = useState<Token | undefined>(undefined);
  const [boundInput, setBoundInput] = useState("");
  const tokens = useDefaultTokenList();
  const environment = useEnvironment();
  const marketToken = useMarketToken(specToken, "+");
  const factoryContract = useFactory(true);

  // TODO: check if pool already exists

  // price is in terms of base / speculative
  const invertPriceQuery =
    specToken && baseToken
      ? sortTokens([specToken, baseToken])[0].equals(specToken)
      : null;

  const mostLiquidQuery = useMostLiquidMarket([specToken, baseToken] as const);

  const currentPriceQuery = useCurrentPrice(mostLiquidQuery.data);

  const currentPrice = useMemo(() => {
    if (!currentPriceQuery.data) return null;
    return invertPriceQuery
      ? currentPriceQuery.data.invert()
      : currentPriceQuery.data;
  }, [currentPriceQuery.data, invertPriceQuery]);

  const removeBase = useMemo(
    () =>
      tokens.data ? tokens.data.filter((t) => t !== baseToken) : undefined,
    [baseToken, tokens.data]
  );

  const removeSpec = useMemo(
    () =>
      tokens.data ? tokens.data.filter((t) => t !== specToken) : undefined,
    [specToken, tokens.data]
  );

  const bound = useMemo(
    () => (marketToken ? TokenAmount.parse(marketToken, boundInput) : null),
    [boundInput, marketToken]
  );

  const disableReason = useMemo(
    () =>
      !specToken || !baseToken
        ? "Select a token"
        : !tokens || !currentPrice || !factoryContract
        ? "Loading"
        : !baseToken.equals(environment.interface.wrappedNative) &&
          !baseToken.equals(environment.interface.stablecoin) &&
          !specToken.equals(environment.interface.wrappedNative) &&
          !specToken.equals(environment.interface.stablecoin)
        ? `One token must be ${environment.interface.wrappedNative.symbol} or ${environment.interface.stablecoin.symbol}`
        : boundInput === ""
        ? "Enter an amount"
        : !bound || bound.equalTo(0)
        ? "Invalid amount"
        : null,
    [
      baseToken,
      bound,
      boundInput,
      currentPrice,
      environment.interface.stablecoin,
      environment.interface.wrappedNative,
      factoryContract,
      specToken,
      tokens,
    ]
  );

  return (
    <div tw="flex flex-col lg:pt-12 max-w-lg gap-4">
      <p>
        Numoen allows for the permissionless creation of markets. Read here to
        learn more about the structure of a Numoen market.
      </p>
      <div tw="rounded-lg p-4 flex flex-col w-full shadow-2xl bg-amber-200">
        <RowBetween>
          <p>Speculative token</p>
          <div>
            <TokenSelection
              selectedToken={specToken}
              onSelect={setSpecToken}
              tokens={removeBase}
            />
          </div>
        </RowBetween>
        <RowBetween>
          <p>Base token</p>
          <div>
            <TokenSelection
              selectedToken={baseToken}
              onSelect={setBaseToken}
              tokens={removeSpec}
            />
          </div>
        </RowBetween>
        <RowBetween>
          <p>Upper bound</p>
          {/* TODO: make a slider */}
          <BigNumericInput
            tw="text-right text-lg"
            inputMode="numeric"
            autoComplete="off"
            disabled={false}
            value={boundInput}
            onChange={(val: string) => setBoundInput(val)}
          />
        </RowBetween>
        {currentPrice && (
          <RowBetween>
            <p>Current price</p>
            <p>
              {currentPrice.toSignificant(6, { groupSeparator: "," })}{" "}
              <span tw="text-xs text-secondary">
                {baseToken?.symbol} / {specToken?.symbol}
              </span>
            </p>
          </RowBetween>
        )}
      </div>
      <AsyncButton
        variant="primary"
        tw="py-2"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(specToken && baseToken && bound && factoryContract);
          await Beet("Deploy new market", [
            {
              stageTitle: "Deploy new market",
              parallelTransactions: [
                {
                  title: "Deploy new market",
                  description: `Deploy a ${specToken.symbol} + ${baseToken.symbol} market`,
                  txEnvelope: () =>
                    factoryContract.createLendgine(
                      baseToken.address,
                      specToken.address,
                      baseToken.decimals,
                      specToken.decimals,
                      bound.raw.toString()
                    ),
                },
              ],
            },
          ]);

          setSpecToken(undefined);
          setBaseToken(undefined);
          setBoundInput("");
        }}
      >
        {disableReason ?? "Create new market"}
      </AsyncButton>
    </div>
  );
};
