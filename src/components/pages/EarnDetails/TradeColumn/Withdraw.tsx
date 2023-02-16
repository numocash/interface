import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/environment2";
import { useSettings } from "../../../../contexts/settings";
import {
  useLiquidityManagerRemoveLiquidity,
  usePrepareLiquidityManagerRemoveLiquidity,
} from "../../../../generated";
import {
  useLendgine,
  useLendginePosition,
} from "../../../../hooks/useLendgine";
import { useBeet } from "../../../../utils/beet";
import {
  accruedLendgineInfo,
  convertPositionToLiquidity,
} from "../../../../utils/Numoen/lendgineMath";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../utils/Numoen/trade";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { PercentageSlider } from "../../../common/inputs/PercentageSlider";
import { useEarnDetails } from "..";

export const Withdraw: React.FC = () => {
  const { setClose, base, quote, selectedLendgine } = useEarnDetails();
  const { address } = useAccount();

  const Beet = useBeet();
  const settings = useSettings();
  const environment = useEnvironment();

  const [withdrawPercent, setWithdrawPercent] = useState(20);
  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const position = useLendginePosition(selectedLendgine, address);

  const isInverse = selectedLendgine.token1.equals(base);

  const { quoteAmount, baseAmount, size, liquidity } = useMemo(() => {
    if (
      lendgineInfoQuery.isLoading ||
      position.isLoading ||
      !position.data ||
      !lendgineInfoQuery?.data
    )
      return {};

    const updatedLendgineInfo = accruedLendgineInfo(
      selectedLendgine,
      lendgineInfoQuery.data
    );

    const size = position.data.size.multiply(withdrawPercent).divide(100);
    const liquidity = convertPositionToLiquidity({ size }, updatedLendgineInfo);

    const amount0 = updatedLendgineInfo.reserve0
      .multiply(liquidity)
      .multiply(withdrawPercent)
      .divide(updatedLendgineInfo.totalSupply)
      .divide(100);

    const amount1 = updatedLendgineInfo.reserve1
      .multiply(liquidity)
      .multiply(withdrawPercent)
      .divide(updatedLendgineInfo.totalSupply)
      .divide(100);

    return {
      quoteAmount: isInverse ? amount0 : amount1,
      baseAmount: isInverse ? amount1 : amount0,
      size,
      liquidity,
    };
  }, [
    isInverse,
    lendgineInfoQuery.data,
    lendgineInfoQuery.isLoading,
    position.data,
    position.isLoading,
    selectedLendgine,
    withdrawPercent,
  ]);

  const args = useMemo(
    () =>
      !!address && !!size && !!baseAmount && !!quoteAmount
        ? ([
            {
              token0: getAddress(selectedLendgine.token0.address),
              token1: getAddress(selectedLendgine.token1.address),
              token0Exp: BigNumber.from(selectedLendgine.token0.decimals),
              token1Exp: BigNumber.from(selectedLendgine.token1.decimals),
              upperBound: BigNumber.from(
                selectedLendgine.bound.asFraction
                  .multiply(scale)
                  .quotient.toString()
              ),
              amount0Min: BigNumber.from(
                (base.equals(selectedLendgine.token0)
                  ? baseAmount
                  : quoteAmount
                )
                  .multiply(
                    ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                  )
                  .quotient.toString()
              ),
              amount1Min: BigNumber.from(
                (base.equals(selectedLendgine.token0)
                  ? quoteAmount
                  : baseAmount
                )
                  .multiply(
                    ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                  )
                  .quotient.toString()
              ),
              // amount0Min: BigNumber.from(0),
              // amount1Min: BigNumber.from(0),
              size: BigNumber.from(size.quotient.toString()),

              recipient: address,
              deadline: BigNumber.from(
                Math.round(Date.now() / 1000) + settings.timeout * 60
              ),
            },
          ] as const)
        : undefined,
    [
      address,
      base,
      baseAmount,
      quoteAmount,
      selectedLendgine.bound.asFraction,
      selectedLendgine.token0,
      selectedLendgine.token1.address,
      selectedLendgine.token1.decimals,
      settings.maxSlippagePercent,
      settings.timeout,
      size,
    ]
  );

  const prepareRemove = usePrepareLiquidityManagerRemoveLiquidity({
    address: environment.base.liquidityManager,
    args: args,
    enabled: !!args,
  });

  const sendRemove = useLiquidityManagerRemoveLiquidity(prepareRemove.config);

  // TODO: insufficient liquidity
  const disableReason = useMemo(
    () =>
      withdrawPercent === 0
        ? "Slide to amount"
        : !quoteAmount ||
          !baseAmount ||
          !size ||
          !liquidity ||
          lendgineInfoQuery.isLoading ||
          !lendgineInfoQuery.data ||
          prepareRemove.isLoading
        ? "Loading"
        : liquidity.greaterThan(lendgineInfoQuery.data.totalLiquidity)
        ? "Insufficient liquidity"
        : null,
    [
      baseAmount,
      lendgineInfoQuery.data,
      lendgineInfoQuery.isLoading,
      liquidity,
      prepareRemove.isLoading,
      quoteAmount,
      size,
      withdrawPercent,
    ]
  );

  return (
    <div tw="flex flex-col gap-4 w-full">
      <button onClick={() => setClose(false)} tw="items-center flex">
        <div tw="text-xs flex gap-1 items-center">
          <FaChevronLeft />
          Back
        </div>
      </button>

      <div tw="flex flex-col rounded-lg bg-gray-100">
        <div tw=" pb-3 gap-2 flex flex-col bg-white w-full">
          <PercentageSlider
            disabled={false}
            input={withdrawPercent}
            onChange={setWithdrawPercent}
          />
        </div>
        <div tw="flex items-center justify-center self-center">
          <div tw="text-secondary  justify-center items-center flex text-sm border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white w-0" />
        </div>
        <div tw="flex flex-col gap-2 pt-3">
          <AssetSelection
            tw=""
            selectedValue={quote}
            inputValue={
              quoteAmount?.toSignificant(6, { groupSeparator: "," }) ?? "--"
            }
            inputDisabled={true}
          />
          <AssetSelection
            tw=""
            selectedValue={base}
            inputValue={
              baseAmount?.toSignificant(6, { groupSeparator: "," }) ?? "--"
            }
            inputDisabled={true}
          />
        </div>
      </div>

      <AsyncButton
        disabled={!!disableReason}
        variant="primary"
        tw="h-12 text-lg"
        onClick={async () => {
          await Beet([
            {
              stageTitle: `Remove ${quote.symbol} / ${base.symbol} liquidty`,
              parallelTransactions: [
                {
                  title: `Remove ${quote.symbol} / ${base.symbol} liquidty`,
                  tx: {
                    prepare: prepareRemove as ReturnType<
                      typeof usePrepareContractWrite
                    >,
                    send: sendRemove,
                  },
                },
              ],
            },
          ]);
          setClose(false);
        }}
      >
        {disableReason ?? "Withdraw"}
      </AsyncButton>
    </div>
  );
};
