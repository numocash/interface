import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { parseUnits } from "@ethersproject/units";
import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import type { usePrepareContractWrite } from "wagmi";
import { useSigner } from "wagmi";

import { useEnvironment } from "../../../contexts/environment2";
import {
  useFactory,
  useFactoryCreateLendgine,
  useFactoryGetLendgine,
  usePrepareFactoryCreateLendgine,
} from "../../../generated";
import {
  useCurrentPrice,
  useMostLiquidMarket,
} from "../../../hooks/useExternalExchange";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { useDefaultTokenList } from "../../../hooks/useTokens2";
import { useBeet } from "../../../utils/beet";
import { AsyncButton } from "../../common/AsyncButton";
import { BigNumericInput } from "../../common/inputs/BigNumericInput";
import { RowBetween } from "../../common/RowBetween";
import { TokenSelection } from "../../common/TokenSelection";

export const Create: React.FC = () => {
  const Beet = useBeet();
  const [specToken, setSpecToken] = useState<WrappedTokenInfo | undefined>(
    undefined
  );
  const [baseToken, setBaseToken] = useState<WrappedTokenInfo | undefined>(
    undefined
  );
  const [boundInput, setBoundInput] = useState("");
  const tokens = useDefaultTokenList();
  const environment = useEnvironment();
  const signer = useSigner();
  const factoryContract = useFactory({
    address: environment.base.factory,
    signerOrProvider: signer.data,
  });

  // price is in terms of base / speculative
  const invertPriceQuery =
    specToken && baseToken ? specToken.sortsBefore(baseToken) : null;

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

  const bound = useMemo(() => {
    try {
      const parsed = parseUnits(boundInput);
      return new Fraction(JSBI.BigInt(parsed));
    } catch (err) {
      console.error(err);
    }
    return undefined;
  }, [boundInput]);

  const lendgine = useFactoryGetLendgine({
    args:
      baseToken && specToken && bound
        ? ([
            getAddress(baseToken.address),
            getAddress(specToken.address),
            BigNumber.from(baseToken.decimals),
            BigNumber.from(specToken.decimals),
            BigNumber.from(bound.quotient.toString()),
          ] as const)
        : undefined,
    address: environment.base.factory,
    enabled: !!baseToken && !!specToken && !!bound,
    watch: true,
    staleTime: Infinity,
  });

  const prepare = usePrepareFactoryCreateLendgine({
    args:
      baseToken && specToken && bound
        ? [
            getAddress(baseToken.address),
            getAddress(specToken.address),
            baseToken.decimals,
            specToken.decimals,
            BigNumber.from(bound.quotient.toString()),
          ]
        : undefined,
    address: environment.base.factory,
    enabled: !!baseToken && !!specToken && !!bound,
  });
  const write = useFactoryCreateLendgine(prepare.data);

  const disableReason = useMemo(
    () =>
      !specToken || !baseToken
        ? "Select a token"
        : boundInput === ""
        ? "Enter an amount"
        : !tokens ||
          !currentPrice ||
          !factoryContract ||
          !lendgine.data ||
          !prepare.config
        ? "Loading"
        : lendgine.data !== AddressZero
        ? " Market already exists"
        : !baseToken.equals(environment.interface.wrappedNative) &&
          !baseToken.equals(environment.interface.stablecoin) &&
          !specToken.equals(environment.interface.wrappedNative) &&
          !specToken.equals(environment.interface.stablecoin)
        ? `One token must be ${
            environment.interface.wrappedNative.symbol ?? ""
          } or ${environment.interface.stablecoin.symbol ?? ""}`
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
      prepare.config,
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
            placeholder="0"
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
          await Beet([
            {
              stageTitle: `New ${specToken.symbol ?? ""} + ${
                baseToken.symbol ?? ""
              } market`,
              parallelTransactions: [
                {
                  title: `New ${specToken.symbol ?? ""} + ${
                    baseToken.symbol ?? ""
                  } market`,
                  tx: {
                    prepare: prepare as ReturnType<
                      typeof usePrepareContractWrite
                    >,
                    send: write,
                  },
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
