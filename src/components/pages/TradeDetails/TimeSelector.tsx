import { useState } from "react";
import tw, { css } from "twin.macro";

enum Times {
  ONE_DAY = "1d",
  ONE_WEEK = "1w",
  THREE_MONTH = "3m",
  ONE_YEAR = "1y",
}

export const TimeSelector: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Times>(Times.ONE_WEEK);

  return (
    <div tw="flex gap-4 grid-flow-col text-sm justify-end py-4">
      {[Times.ONE_DAY, Times.ONE_WEEK, Times.THREE_MONTH, Times.ONE_YEAR].map(
        (s) => {
          return (
            <div key={s}>
              <button
                css={css`
                  ${tw`grid font-semibold rounded justify-items-center text-secondary`}
                  ${tw`hover:(text-default)`}
            ${timeframe === s && tw`text-default`}
                `}
                onClick={() => setTimeframe(s)}
              >
                <span>{s}</span>
              </button>
            </div>
          );
        }
      )}
    </div>
  );
};
