import { useState } from "react";
import tw, { css } from "twin.macro";

import { Config } from "./Config";
import { Long } from "./Long";
import { ProvideLiquidity } from "./ProvideLiquidity";
import { Returns } from "./Returns";
import { Short } from "./Short";
import { TotalStats } from "./TotalStats";

enum ActionType {
  Long = "Long",
  Short = "Short",
  // Swap = "Swap",
}

export const TradeColumn: React.FC = () => {
  const [action, setAction] = useState<ActionType>(ActionType.Long);

  const Tabs = (
    <div tw="flex gap-4 text-sm justify-around items-center w-full col-start-2 col-span-5">
      {[ActionType.Long, ActionType.Short].map((s) => {
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
      {action === ActionType.Long && <Long />}
      {action === ActionType.Short && <Short />}
      <ProvideLiquidity />
      <div tw="w-full border-b-2 border-gray-200" />
      <Returns />
      <div tw="w-full border-b-2 border-gray-200" />
      <TotalStats />
      <div tw="w-full border-b-2 border-gray-200" />
      <Config />
    </div>
  );
};
