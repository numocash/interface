import tw, { css } from "twin.macro";

import { Module } from "../../../common/Module";
import { ActionType, useManage } from ".";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";

export const Action: React.FC = () => {
  const { action, setAction } = useManage();

  const Tabs = (
    <div tw="p-1 flex gap-0.5 grid-flow-col text-sm justify-center w-min rounded bg-action">
      {[ActionType.Deposit, ActionType.Withdraw].map((s) => {
        return (
          <div key={s}>
            <button
              css={css`
                ${tw`grid px-4 py-2 text-xl font-semibold rounded justify-items-center text-secondary`}
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
    <Module>
      {Tabs}
      {action === ActionType.Deposit ? <Deposit /> : <Withdraw />}
    </Module>
  );
};
