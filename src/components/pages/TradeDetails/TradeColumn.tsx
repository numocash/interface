import { useState } from "react";
import invariant from "tiny-invariant";
import tw, { css } from "twin.macro";

import { useSpeculativeTokens } from "../../../hooks/useTokens";
import { AssetSelection } from "../../common/AssetSelection";
import { CenterSwitch } from "../../common/CenterSwitch";
import { ProvideLiquidity } from "./ProvideLiquidity";
import { TotalStats } from "./TotalStats";

enum ActionType {
  Long = "Long",
  Short = "Short",
  Swap = "Swap",
}

export const TradeColumn: React.FC = () => {
  const [action, setAction] = useState<ActionType>(ActionType.Long);

  const token = useSpeculativeTokens()[0];
  invariant(token);

  const Tabs = (
    <div tw="flex gap-4 text-sm justify-around items-center w-full col-start-2 col-span-5">
      {[ActionType.Long, ActionType.Short, ActionType.Swap].map((s) => {
        return (
          <div key={s}>
            <button
              css={css`
                ${tw`text-xl font-semibold text-secondary`}
                ${tw`hover:(text-default)`}
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
    <div tw="pl-12 py-2 flex flex-col gap-4 w-full">
      {Tabs}
      <div tw="">
        <AssetSelection
          label={<span>From</span>}
          // onSelect={(value) => onFieldSelect(Field.Input, value)}
          selectedValue={token}
          // inputValue={typedValue}
          // inputOnChange={(value) => onFieldInput(Field.Input, value)}
          currentAmount={{
            amount: undefined,
            allowSelect: true,
          }}
        />
        <CenterSwitch icon="arrow" />
        <AssetSelection
          label={<span>To</span>}
          // onSelect={(value) => onFieldSelect(Field.Input, value)}
          selectedValue={token}
          // inputValue={typedValue}
          // inputOnChange={(value) => onFieldInput(Field.Input, value)}
          currentAmount={{
            amount: undefined,
            allowSelect: true,
          }}
        />
      </div>
      <ProvideLiquidity />
      <TotalStats />
    </div>
  );
};
