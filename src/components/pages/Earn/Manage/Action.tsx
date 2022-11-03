import tw, { css } from "twin.macro";

import { Module } from "../../../common/Module";
import { ActionType, useManage } from ".";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";

export const Action: React.FC = () => {
  const { action, setAction } = useManage();

  const Tabs = (
    <div tw="flex gap-4 grid-flow-col text-sm justify-center w-min bg-action rounded-lg px-6 pt-6">
      {[ActionType.Deposit, ActionType.Withdraw].map((s) => {
        return (
          <div key={s}>
            <button
              css={css`
                ${tw`grid text-xl font-semibold rounded justify-items-center text-secondary`}
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
    <Module tw="p-0">
      {Tabs}
      {action === ActionType.Deposit ? <Deposit /> : <Withdraw />}
    </Module>
  );
};
