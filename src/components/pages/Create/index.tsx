import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useSigner } from "wagmi";

import { useEnvironment } from "../../../contexts/environment2";
import { useFactory, useFactoryGetLendgine } from "../../../generated";
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
  const signer = useSigner();
  const factoryContract = useFactory({
    address: environment.base.factory,
    signerOrProvider: signer.data,
  });

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

  const lendgine = useFactoryGetLendgine({
    args:
      baseToken && specToken && bound
        ? [
            getAddress(baseToken.address),
            getAddress(specToken.address),
            BigNumber.from(baseToken.decimals),
            BigNumber.from(specToken.decimals),
            BigNumber.from(bound.raw.toString()),
          ]
        : undefined,
    address: environment.base.factory,
    watch: true,
    staleTime: Infinity,
  });

  const disableReason = useMemo(
    () =>
      !specToken || !baseToken
        ? "Select a token"
        : !tokens || !currentPrice || !factoryContract || !lendgine.data
        ? "Loading"
        : lendgine.data !== AddressZero
        ? " Market already exists"
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
      lendgine.data,
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
      <div tw="rounded-lg p-4 gap-4 flex flex-col w-full shadow-2xl border-2 border-gray-300">
        <RowBetween tw="items-center p-0">
          <p>Long</p>
          <div>
            <TokenSelection
              selectedToken={specToken}
              onSelect={setSpecToken}
              tokens={removeBase}
            />
          </div>
        </RowBetween>
        <RowBetween tw="items-center p-0">
          <p>Short</p>
          <div>
            <TokenSelection
              selectedToken={baseToken}
              onSelect={setBaseToken}
              tokens={removeSpec}
            />
          </div>
        </RowBetween>
        <RowBetween tw="items-center p-0">
          <p>Bound</p>
          <BigNumericInput
            tw="text-right text-lg border-2 border-blue"
            inputMode="numeric"
            autoComplete="off"
            disabled={false}
            value={boundInput}
            onChange={(val: string) => setBoundInput(val)}
          />
        </RowBetween>
        {currentPrice && (
          <div tw="w-full justify-end flex mt-[-1rem]">
            <p tw="text-sm">
              {currentPrice.toSignificant(6, { groupSeparator: "," })}{" "}
              <span tw="text-xs text-secondary">
                {baseToken?.symbol} / {specToken?.symbol}
              </span>
            </p>
          </div>
        )}
      </div>
      <AsyncButton
        variant="primary"
        tw="h-12 text-lg"
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
                      getAddress(baseToken.address),
                      getAddress(specToken.address),
                      baseToken.decimals,
                      specToken.decimals,
                      BigNumber.from(bound.raw.toString())
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
