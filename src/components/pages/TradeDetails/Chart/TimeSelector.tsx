import tw, { css } from "twin.macro";

import { useTradeDetails } from "../TradeDetailsInner";

export enum Times {
  ONE_DAY = "1d",
  ONE_WEEK = "1w",
  THREE_MONTH = "3m",
  ONE_YEAR = "1y",
}

export const TimeSelector: React.FC = () => {
  const { timeframe, setTimeframe } = useTradeDetails();

  return (
    <div tw="flex gap-4 grid-flow-col text-sm justify-end py-2">
      {[Times.ONE_DAY, Times.ONE_WEEK, Times.THREE_MONTH, Times.ONE_YEAR].map(
        (s) => {
          return (
            <div key={s}>
              <button
                css={css`
                  ${tw`grid font-semibold rounded justify-items-center text-secondary`}
                  ${tw`hover:(text-default) transform duration-300 ease-in-out`}
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
