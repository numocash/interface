import { useState } from "react";
import { objectKeys } from "ts-extras";
import tw, { css } from "twin.macro";

import { PersonalHistory } from "./PersonalHistory/PersonalHistory";
import { Positions } from "./Positions/Positions";

const Histories = {
  position: "Your positions",
  personalHistory: "Your trade history",
  totalHistory: "Total trade history",
} as const;

export const History: React.FC = () => {
  const [history, setHistory] = useState<keyof typeof Histories>("position");

  return (
    <>
      <div tw="flex gap-4 grid-flow-col">
        {objectKeys(Histories).map((s) => {
          return (
            <div key={s}>
              <button
                css={css`
                  ${tw`grid font-semibold rounded justify-items-center text-secondary`}
                  ${tw`hover:(text-default) transform duration-300 ease-in-out`}
            ${history === s && tw`text-default`}
                `}
                onClick={() => setHistory(s)}
              >
                <span>{Histories[s]}</span>
              </button>
            </div>
          );
        })}
      </div>
      {history === "position" && <Positions />}
      {history === "personalHistory" && <PersonalHistory />}
    </>
  );
};
