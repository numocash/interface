import { utils } from "ethers";
import tw, { css } from "twin.macro";

import { isLongLendgine } from "../../../../lib/lendgines";
import { useTradeDetails } from "../TradeDetailsInner";
import { useNextLendgines } from "../useNextLendgine";
import { Trade } from "./Trade";

export const TradeTab = {
  Long: "Long",
  Short: "Short",
} as const;

export const TradeColumn: React.FC = () => {
  const { base, setSelectedLendgine, selectedLendgine, close } =
    useTradeDetails();

  const { longLendgine, shortLendgine } = useNextLendgines();

  const Tabs = (
    <div tw="w-full justify-start flex">
      <div tw="flex text-lg justify-end p-0.5 items-center rounded-xl bg-gray-100">
        {[longLendgine, shortLendgine].map((s) => {
          if (!s) return null;
          const isLong = isLongLendgine(s, base);

          return (
            <div key={s.address}>
              <button
                css={css`
                  ${tw`grid px-2 py-1 font-semibold text-gray-500 border border-transparent rounded-xl justify-items-center`}
                  ${tw`hover:(text-gray-700) transform duration-300 ease-in-out`}
                ${utils.getAddress(s.address) ===
                    utils.getAddress(selectedLendgine.address) &&
                  tw`text-black bg-white rounded-[10px] border-gray-300/50`}
                `}
                onClick={() => {
                  setSelectedLendgine(s);
                }}
              >
                <span>{isLong ? "Long" : "Short"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
  return (
    <div tw="w-full flex flex-col gap-4 bg-white border rounded border-gray-200 p-6 shadow">
      {!close && Tabs}
      <Trade />
    </div>
  );
};
