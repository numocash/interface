import { useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import invariant from "tiny-invariant";

import { useLendgine } from "../../../../hooks/useLendgine";
import { isLongLendgine } from "../../../../lib/lendgines";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { CenterSwitch } from "../../../common/CenterSwitch";
import { PercentageSlider } from "../../../common/inputs/PercentageSlider";
import { useEarnDetails } from "../EarnDetailsInner";
import { useWithdraw, useWithdrawAmounts } from "./useWithdraw";

export const Withdraw: React.FC = () => {
  const { setClose, base, quote, selectedLendgine } = useEarnDetails();

  const [withdrawPercent, setWithdrawPercent] = useState(20);
  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const isLong = isLongLendgine(selectedLendgine, base);

  const { liquidity, size, amount0, amount1 } = useWithdrawAmounts({
    withdrawPercent,
  });
  const { baseAmount, quoteAmount } = useMemo(
    () =>
      isLong
        ? { baseAmount: amount0, quoteAmount: amount1 }
        : { baseAmount: amount1, quoteAmount: amount0 },
    [amount0, amount1, isLong]
  );

  const withdraw = useWithdraw({ size, amount0, amount1 });

  const disableReason = useMemo(
    () =>
      withdrawPercent === 0
        ? "Slide to amount"
        : !quoteAmount ||
          !baseAmount ||
          !size ||
          !liquidity ||
          !lendgineInfoQuery.data
        ? "Loading"
        : liquidity.greaterThan(lendgineInfoQuery.data.totalLiquidity)
        ? "Insufficient liquidity"
        : null,
    [
      baseAmount,
      lendgineInfoQuery.data,
      liquidity,
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

      <div tw="flex flex-col rounded-lg border border-gray-200">
        <div tw=" px-2 py-2 gap-2 flex flex-col w-full">
          <PercentageSlider
            disabled={false}
            input={withdrawPercent}
            onChange={setWithdrawPercent}
          />
        </div>
        <div tw=" border-b w-full border-gray-200" />
        <CenterSwitch icon="arrow" />
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
          invariant(withdraw);
          await withdraw();
          setClose(false);
        }}
      >
        {disableReason ?? "Withdraw"}
      </AsyncButton>
    </div>
  );
};
