import { useMemo } from "react";
import { FaArrowDown } from "react-icons/fa";

import { PercentageSlider } from "../../../common/inputs/PercentageSlider";
import { TokenInfo } from "../../../common/TokenInfo";
import { scale } from "../../Trade/useTrade";
import { useRemovePosition } from ".";

export const SelectRemove: React.FC = () => {
  const { removePercent, setRemovePercent, market, userInfo } =
    useRemovePosition();

  const removeAmount = useMemo(
    () =>
      userInfo
        ? userInfo.liquidity.multiply(removePercent).divide(scale).divide(100)
        : null,
    [removePercent, userInfo]
  );
  return market ? (
    <div tw="flex flex-col gap-3 w-full ">
      <div tw="text-default p-4">
        <PercentageSlider
          disabled={false}
          input={removePercent}
          onChange={setRemovePercent}
        />
      </div>
      <div tw="flex w-full justify-center">
        <FaArrowDown tw="text-default justify-self-center" />
      </div>

      <div tw="flex flex-col items-center text-default w-full p-4 bg-action rounded-xl gap-4">
        <div tw="flex w-full justify-between items-center">
          <TokenInfo iconSize={24} small token={market.pair.baseToken} />
          <div tw="text-xl">
            {removeAmount?.toFixed(2, {
              groupSeparator: ",",
            })}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
