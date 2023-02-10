import { useState } from "react";
import { objectKeys } from "ts-extras";
import tw, { css } from "twin.macro";

const Histories = {
  position: "Your positions",
} as const;

export const History: React.FC = () => {
  const [history, setHistory] = useState<keyof typeof Histories>("position");

  return (
    <div tw="flex gap-4 grid-flow-col  py-4">
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
  );
};
