import { objectKeys } from "ts-extras";
import tw, { css } from "twin.macro";

import { useTradeDetails } from "../TradeDetailsInner";

export const Times = {
  ONE_DAY: "1d",
  ONE_WEEK: "1w",
  THREE_MONTH: "3m",
  ONE_YEAR: "1y",
} as const;

export const TimeSelector: React.FC = () => {
  const { timeframe, setTimeframe } = useTradeDetails();

  return (
    <div tw="w-full justify-end flex">
      <div tw="flex text-sm justify-end p-0.5 items-center rounded-xl bg-gray-100">
        {objectKeys(Times).map((s) => {
          return (
            <div tw="" key={s}>
              <button
                css={css`
                  ${tw`grid px-1.5 py-1 font-semibold border border-transparent rounded-xl justify-items-center text-[#8f8f8f]`}
                  ${tw`hover:(text-headline) transform duration-300 ease-in-out`}
            ${timeframe === s &&
                  tw`text-black bg-white rounded-[10px] border-gray-300/50`}
                `}
                onClick={() => setTimeframe(s)}
              >
                <span>{Times[s]}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
