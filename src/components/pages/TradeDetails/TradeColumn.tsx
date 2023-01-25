import { useState } from "react";
import tw, { css } from "twin.macro";

import { AssetSelection } from "../../common/AssetSelection";
import { Button } from "../../common/Button";
import { CenterSwitch } from "../../common/CenterSwitch";
import { useTradeDetails } from ".";
import { ProvideLiquidity } from "./ProvideLiquidity";
import { TotalStats } from "./TotalStats";
import { TradeStats } from "./TradeStats";

enum ActionType {
  Long = "Long",
  Short = "Short",
  Swap = "Swap",
}

export const TradeColumn: React.FC = () => {
  const [action, setAction] = useState<ActionType>(ActionType.Long);

  const { denom, other } = useTradeDetails();

  const Tabs = (
    <div tw="flex gap-4 text-sm justify-around items-center w-full col-start-2 col-span-5">
      {[ActionType.Long, ActionType.Short, ActionType.Swap].map((s) => {
        return (
          <div key={s}>
            <button
              css={css`
                ${tw`text-xl font-semibold text-secondary`}
                ${tw`hover:(text-default) transform duration-300 ease-in-out`}
                ${action === s && tw`text-default`}
              `}
              onClick={() => setAction(s)}
            >
              <span>{s}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
  return (
    <div tw="pl-6 lg:pl-8 xl:pl-12 transform ease-in-out duration-300 py-2 flex flex-col gap-4 w-full">
      {Tabs}
      <div tw="rounded-lg border-2 border-blue">
        <AssetSelection
          tw=""
          label={<span>From</span>}
          // onSelect={(value) => onFieldSelect(Field.Input, value)}
          selectedValue={other}
          // inputValue={typedValue}
          // inputOnChange={(value) => onFieldInput(Field.Input, value)}
          currentAmount={{
            amount: undefined,
            allowSelect: true,
          }}
        />
        <div tw="border-blue border-b-2 w-full" />
        <CenterSwitch icon="arrow" />
        <AssetSelection
          label={<span>To</span>}
          // onSelect={(value) => onFieldSelect(Field.Input, value)}
          selectedValue={denom}
          // inputValue={typedValue}
          // inputOnChange={(value) => onFieldInput(Field.Input, value)}
          currentAmount={{
            amount: undefined,
            allowSelect: true,
          }}
        />
      </div>
      <TradeStats />
      <Button variant="primary" tw="h-12 text-xl font-bold">
        Trade
      </Button>
      <ProvideLiquidity />
      <div tw="w-full border-b-2 border-gray-200" />
      <TotalStats />
    </div>
  );
};
