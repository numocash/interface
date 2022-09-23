import { TokenAmount } from "@dahlia-labs/token-utils";

import { CenterSwitch } from "../../../common/CenterSwitch";
import { PercentageSlider } from "../../../common/inputs/PercentageSlider";
import { Module } from "../../../common/Module";
import { TokenInfo } from "../../../common/TokenInfo";
import { useRemovePosition } from ".";

export const SelectRemove: React.FC = () => {
  const { removePercent, setRemovePercent, market } = useRemovePosition();
  return market ? (
    <Module tw="flex flex-col w-full  max-w-2xl">
      <div tw="flex flex-col items-center rounded-xl bg-action text-default p-4">
        <PercentageSlider
          disabled={false}
          input={removePercent}
          onChange={setRemovePercent}
        />
      </div>
      <CenterSwitch icon="arrow" />

      <div tw="flex flex-col items-center text-default w-full p-4 bg-action rounded-xl gap-4">
        {[
          TokenAmount.parse(market.pair.speculativeToken, "1"),
          TokenAmount.parse(market.pair.baseToken, "1"),
        ].map((w) => (
          <div
            tw="flex w-full justify-between items-center"
            key={w.token.address}
          >
            <TokenInfo iconSize={24} small token={w.token} />
            <div tw="text-xl">
              {w.toFixed(2, {
                groupSeparator: ",",
              })}
            </div>
          </div>
        ))}
      </div>
    </Module>
  ) : null;
};
