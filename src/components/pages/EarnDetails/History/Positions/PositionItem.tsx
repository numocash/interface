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
import {
  accruedLendgineInfo,
  accruedLendginePositionInfo,
  convertPositionToLiquidity,
} from "../../../../../utils/Numoen/lendgineMath";
import { AsyncButton } from "../../../../common/AsyncButton";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { useEarnDetails } from "../..";

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
  const { base, setSelectedLendgine, setClose } = useEarnDetails();
  const isInverse = base.equals(lendgine.token1);

  const { updatedLendgineInfo, updatedPositionInfo } = useMemo(
    () => ({
      updatedLendgineInfo: accruedLendgineInfo(lendgine, lendgineInfo),
      updatedPositionInfo: accruedLendginePositionInfo(
        lendgine,
        accruedLendgineInfo(lendgine, lendgineInfo),
        position
      ),
    }),
    [lendgine, lendgineInfo, position]
  );

  const { amount0, amount1 } = useMemo(() => {
    if (updatedLendgineInfo.totalSupply.equalTo(0))
      return {
        amount0: CurrencyAmount.fromRawAmount(lendgine.token0, 0),
        amount1: CurrencyAmount.fromRawAmount(lendgine.token1, 0),
      };

    const amount0 = updatedLendgineInfo.reserve0
      .multiply(convertPositionToLiquidity(position, updatedLendgineInfo))
      .divide(updatedLendgineInfo.totalSupply);

    const amount1 = updatedLendgineInfo.reserve1
      .multiply(convertPositionToLiquidity(position, updatedLendgineInfo))
      .divide(updatedLendgineInfo.totalSupply);

    return { amount0, amount1 };
  }, [lendgine.token0, lendgine.token1, position, updatedLendgineInfo]);

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
    <div
      tw="w-full justify-between grid grid-cols-7 h-12 items-center"
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
          disabled={
            prepareCollect.isLoading ||
            updatedPositionInfo.tokensOwed.equalTo(0)
          }
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

      <p tw="justify-self-start col-span-2">N/A</p>

      <button
        tw="text-red text-lg font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90"
        onClick={() => {
          setSelectedLendgine(lendgine);
          setClose(true);
        }}
      >
        Close
      </button>
    </div>
  );
};
