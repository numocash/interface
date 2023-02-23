import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { Fraction } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import type { usePrepareContractWrite } from "wagmi";
import { useSigner } from "wagmi";

import { useEnvironment } from "../../../contexts/environment2";
import {
  useFactory,
  useFactoryCreateLendgine,
  usePrepareFactoryCreateLendgine,
} from "../../../generated";
import { useMostLiquidMarket } from "../../../hooks/useExternalExchange";
import { useAllLendgines } from "../../../hooks/useLendgine";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { useDefaultTokenList } from "../../../hooks/useTokens2";
import { useBeet } from "../../../utils/beet";
import { scale } from "../../../utils/Numoen/trade";
import { AsyncButton } from "../../common/AsyncButton";
import { Plus } from "../../common/Plus";
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
  const [bound, setBound] = useState(new Fraction(1));
  const tokens = useDefaultTokenList();
  const environment = useEnvironment();
  const signer = useSigner();
  const factoryContract = useFactory({
    address: environment.base.factory,
    signerOrProvider: signer.data,
  });
  const lendgines = useAllLendgines();

  // price is in terms of base / speculative
  const invertPriceQuery =
    specToken && baseToken ? specToken.sortsBefore(baseToken) : null;

  const mostLiquidQuery = useMostLiquidMarket(
    !!specToken && !!baseToken ? ([specToken, baseToken] as const) : null
  );

  const currentPrice = useMemo(() => {
    if (!mostLiquidQuery.data) return null;
    return invertPriceQuery
      ? mostLiquidQuery.data.price.invert()
      : mostLiquidQuery.data.price;
  }, [invertPriceQuery, mostLiquidQuery.data]);

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

  const prepare = usePrepareFactoryCreateLendgine({
    args:
      baseToken && specToken
        ? [
            getAddress(baseToken.address),
            getAddress(specToken.address),
            baseToken.decimals,
            specToken.decimals,
            BigNumber.from(bound.multiply(scale).quotient.toString()),
          ]
        : undefined,
    address: environment.base.factory,
    enabled: !!baseToken && !!specToken,
  });
  const write = useFactoryCreateLendgine(prepare.data);

  const disableReason = useMemo(
    () =>
      !specToken || !baseToken
        ? "Select a token"
        : !tokens ||
          !currentPrice ||
          !factoryContract ||
          lendgines === null ||
          !prepare.config
        ? "Loading"
        : !baseToken.equals(environment.interface.wrappedNative) &&
          !baseToken.equals(environment.interface.stablecoin) &&
          !specToken.equals(environment.interface.wrappedNative) &&
          !specToken.equals(environment.interface.stablecoin)
        ? `One token must be ${
            environment.interface.wrappedNative.symbol ?? ""
          } or ${environment.interface.stablecoin.symbol ?? ""}`
        : currentPrice.greaterThan(bound)
        ? "Bound can't be below current price"
        : lendgines.find(
            (l) =>
              l.token0.equals(baseToken) &&
              l.token1.equals(specToken) &&
              l.bound.equalTo(bound)
          )
        ? " Market already exists"
        : null,
    [
      baseToken,
      bound,
      currentPrice,
      environment.interface.stablecoin,
      environment.interface.wrappedNative,
      factoryContract,
      lendgines,
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
          <div tw="flex items-center gap-1">
            <Plus icon="minus" onClick={() => setBound(bound.divide(2))} />

            <Plus icon="plus" onClick={() => setBound(bound.multiply(2))} />

            <p>{bound.toSignificant(5)}</p>
          </div>
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
          invariant(specToken && baseToken && factoryContract);
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
          setBound(new Fraction(1));
        }}
      >
        {disableReason ?? "Create new market"}
      </AsyncButton>
    </div>
  );
};
