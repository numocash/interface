import tw, { css } from "twin.macro";

import { isLongLendgine } from "../../../../utils/lendgines";
import { useNextLendgines, useTradeDetails } from "../TradeDetailsInner";
import { Config } from "./Config";
import { ProvideLiquidity } from "./ProvideLiquidity";
import { Returns } from "./Returns";
import { TotalStats } from "./TotalStats";
import { Trade } from "./Trade";

export enum TradeType {
  Long = "Long",
  Short = "Short",
  // Swap = "Swap",
}

export const TradeColumn: React.FC = () => {
  const { trade, base, setSelectedLendgine, selectedLendgine, close } =
    useTradeDetails();

  const { longLendgine, shortLendgine } = useNextLendgines();

  const Tabs = (
    <div tw="flex gap-4 text-sm items-center w-full col-start-2 col-span-5">
      {[longLendgine, shortLendgine].map((s) => {
        if (!s) return null;
        const isLong = isLongLendgine(s, base);

        return (
          <div key={s.address}>
            <button
              css={css`
                ${tw`text-xl font-semibold rounded-lg text-secondary `}
                ${tw`hover:(text-headline) transform duration-300 ease-in-out`}
                ${s === selectedLendgine && tw`text-headline`}
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
  );
  return (
    <div tw="pl-6 lg:pl-8 xl:pl-12 transform ease-in-out duration-300 py-2 flex-col gap-4 w-full hidden xl:flex">
      {!close && Tabs}
      {(trade === TradeType.Long || trade === TradeType.Short) && <Trade />}
      <ProvideLiquidity />
      {!close && (
        <>
          <div tw="w-full border-b-2 border-stroke" />
          <Returns />
        </>
      )}
      <div tw="w-full border-b-2 border-stroke" />
      <TotalStats />
      <div tw="w-full border-b-2 border-stroke" />
      <Config />
    </div>
  );
};
