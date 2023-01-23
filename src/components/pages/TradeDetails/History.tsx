import { useState } from "react";
import tw, { css } from "twin.macro";

enum HistoryType {
  Position = "Your positions",
  Trade = "Your trade history",
  Total = "Total trade history",
}

export const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryType>(HistoryType.Position);

  return (
    <div tw="flex gap-4 grid-flow-col  py-4">
      {[HistoryType.Position, HistoryType.Trade, HistoryType.Total].map((s) => {
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
              <span>{s}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
