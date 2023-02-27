import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "../../../../../constants/types";
import { useEnvironment } from "../../../../../contexts/environment2";
import {
  useLiquidityManagerCollect,
  usePrepareLiquidityManagerCollect,
} from "../../../../../generated";
import { useBeet } from "../../../../../utils/beet";
import { formatPercent } from "../../../../../utils/format";
import { supplyRate } from "../../../../../utils/Numoen/jumprate";
import {
  accruedLendgineInfo,
  accruedLendginePositionInfo,
  liquidityPerPosition,
} from "../../../../../utils/Numoen/lendgineMath";
import {
  pricePerCollateral,
  pricePerLiquidity,
} from "../../../../../utils/Numoen/price";
import { AsyncButton } from "../../../../common/AsyncButton";
import { RowBetween } from "../../../../common/RowBetween";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { useEarnDetails } from "../../EarnDetailsInner";

type Props<L extends Lendgine = Lendgine> = {
  lendgine: L;
  lendgineInfo: LendgineInfo<L>;
  position: LendginePosition<L>;
};

export const PositionItem: React.FC<Props> = ({
  lendgine,
  lendgineInfo,
  position,
}: Props) => {
  const { address } = useAccount();
  const environment = useEnvironment();
  const Beet = useBeet();
  const { base, setSelectedLendgine, setClose, setModalOpen } =
    useEarnDetails();
  const isInverse = base.equals(lendgine.token1);

  const { updatedLendgineInfo, updatedPositionInfo } = useMemo(
    () => ({
      updatedLendgineInfo: accruedLendgineInfo(lendgine, lendgineInfo),
      updatedPositionInfo: accruedLendginePositionInfo(
        accruedLendgineInfo(lendgine, lendgineInfo),
        position
      ),
    }),
    [lendgine, lendgineInfo, position]
  );

  const apr = useMemo(() => {
    // token0 / liq
    const liquidityPrice = pricePerLiquidity({
      lendgine,
      lendgineInfo: updatedLendgineInfo,
    });

    // col / liq
    const collateralPrice = pricePerCollateral(lendgine, updatedLendgineInfo);

    const interestPremium = collateralPrice
      .subtract(liquidityPrice)
      .divide(liquidityPrice);

    return supplyRate(updatedLendgineInfo).multiply(interestPremium);
  }, [lendgine, updatedLendgineInfo]);

  const { amount0, amount1 } = useMemo(() => {
    if (updatedLendgineInfo.totalLiquidity.equalTo(0))
      return {
        amount0: CurrencyAmount.fromRawAmount(lendgine.token0, 0),
        amount1: CurrencyAmount.fromRawAmount(lendgine.token1, 0),
      };

    const liqPerPosition = liquidityPerPosition(lendgine, updatedLendgineInfo);

    const amount0 = updatedLendgineInfo.reserve0
      .multiply(liqPerPosition.quote(position.size))
      .divide(updatedLendgineInfo.totalLiquidity);

    const amount1 = updatedLendgineInfo.reserve1
      .multiply(liqPerPosition.quote(position.size))
      .divide(updatedLendgineInfo.totalLiquidity);

    return { amount0, amount1 };
  }, [lendgine, position.size, updatedLendgineInfo]);

  const prepareCollect = usePrepareLiquidityManagerCollect({
    enabled: !!address,
    address: environment.base.liquidityManager,
    args: address
      ? [
          {
            lendgine: lendgine.address,
            recipient: address,
            amountRequested: BigNumber.from(
              updatedPositionInfo.tokensOwed.quotient.toString()
            ),
          },
        ]
      : undefined,
  });

  const sendCollect = useLiquidityManagerCollect(prepareCollect.config);

  return (
    <>
      <div
        tw="w-full justify-between md:grid grid-cols-7 items-center hidden"
        key={lendgine.address}
      >
        <div tw="  pl-4 col-span-2 flex flex-col gap-1">
          {(isInverse ? [amount1, amount0] : [amount0, amount1]).map((a) => (
            <TokenAmountDisplay
              key={a.currency.address}
              amount={a}
              showIcon
              showSymbol
            />
          ))}
        </div>
        <div tw="col-span-2 flex flex-col gap-1 justify-self-start">
          <TokenAmountDisplay
            tw="col-span-2"
            amount={updatedPositionInfo.tokensOwed}
            showIcon
            showSymbol
          />
          <AsyncButton
            variant="primary"
            tw="w-min px-1 py-0.5"
            disabled={updatedPositionInfo.tokensOwed.equalTo(0)}
            onClick={async () => {
              await Beet([
                {
                  stageTitle: "Collect interest",
                  parallelTransactions: [
                    {
                      title: `Collect interest`,
                      tx: {
                        prepare: prepareCollect as ReturnType<
                          typeof usePrepareContractWrite
                        >,
                        send: sendCollect,
                      },
                    },
                  ],
                },
              ]);
            }}
          >
            Collect
          </AsyncButton>
        </div>

        <p tw="justify-self-start col-span-2">{formatPercent(apr)}</p>

        <button
          tw="text-tertiary text-lg font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90 xl:flex hidden"
          onClick={() => {
            setSelectedLendgine(lendgine);
            setClose(true);
          }}
        >
          Close
        </button>

        <button
          tw="text-tertiary text-lg font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90 xl:hidden"
          onClick={() => {
            setSelectedLendgine(lendgine);
            setClose(true);
            setModalOpen(true);
          }}
        >
          Close
        </button>
      </div>
      <div
        tw="w-full justify-between flex flex-col md:hidden gap-2"
        key={lendgine.address}
      >
        <>
          {(isInverse ? [amount1, amount0] : [amount0, amount1]).map((a) => (
            <RowBetween key={a.currency.address} tw="p-0 items-center">
              <p tw="text-secondary">{a.currency.symbol} amount</p>
              <TokenAmountDisplay amount={a} showIcon showSymbol />
            </RowBetween>
          ))}
        </>

        <RowBetween tw="p-0 items-center">
          <p tw="text-secondary">Interest</p>
          <TokenAmountDisplay
            tw="col-span-2"
            amount={updatedPositionInfo.tokensOwed}
            showIcon
            showSymbol
          />
        </RowBetween>
        <RowBetween tw="p-0 items-center">
          <p tw="text-secondary">Reward APR</p>
          <p>{formatPercent(apr)}</p>
        </RowBetween>

        <AsyncButton
          variant="primary"
          tw="h-8 text-xl"
          disabled={updatedPositionInfo.tokensOwed.equalTo(0)}
          onClick={async () => {
            await Beet([
              {
                stageTitle: "Collect interest",
                parallelTransactions: [
                  {
                    title: `Collect interest`,
                    tx: {
                      prepare: prepareCollect as ReturnType<
                        typeof usePrepareContractWrite
                      >,
                      send: sendCollect,
                    },
                  },
                ],
              },
            ]);
          }}
        >
          Collect
        </AsyncButton>
        <button
          tw="text-button rounded-lg bg-tertiary  h-8 text-xl font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90"
          onClick={() => {
            setSelectedLendgine(lendgine);
            setClose(true);
            setModalOpen(true);
          }}
        >
          Close
        </button>
      </div>
    </>
  );
};
