import { useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { useWithdraw, useWithdrawAmounts } from "./useWithdraw";
import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useLendgine } from "../../../../hooks/useLendgine";
import { Beet } from "../../../../utils/beet";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { CenterSwitch } from "../../../common/CenterSwitch";
import { PercentageSlider } from "../../../common/inputs/PercentageSlider";

export const Withdraw: React.FC = () => {
  const [withdrawPercent, setWithdrawPercent] = useState(20);
  const environment = useEnvironment();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lendgine = environment.interface.liquidStaking!.lendgine;
  const lendgineInfoQuery = useLendgine(lendgine);

  const { liquidity, size, amount0, amount1 } = useWithdrawAmounts({
    withdrawPercent,
  });

  const withdraw = useWithdraw({ size, amount0, amount1 });

  const disableReason = useMemo(
    () =>
      withdrawPercent === 0
        ? "Slide to amount"
        : !amount0 ||
          !amount1 ||
          !size ||
          !liquidity ||
          !lendgineInfoQuery.data ||
          withdraw.status === "error"
        ? "Loading"
        : liquidity.greaterThan(lendgineInfoQuery.data.totalLiquidity)
        ? "Insufficient liquidity"
        : null,
    [
      amount0,
      amount1,
      lendgineInfoQuery.data,
      liquidity,
      size,
      withdraw.status,
      withdrawPercent,
    ]
  );

  return (
    <>
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
            selectedValue={lendgine.token0}
            inputValue={
              amount0?.toSignificant(6, { groupSeparator: "," }) ?? "--"
            }
            inputDisabled={true}
          />
          <AssetSelection
            tw=""
            selectedValue={lendgine.token1}
            inputValue={
              amount1?.toSignificant(6, { groupSeparator: "," }) ?? "--"
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
          invariant(withdraw.data);
          await Beet(withdraw.data);
        }}
      >
        {disableReason ?? "Withdraw"}
      </AsyncButton>
    </>
  );
};
