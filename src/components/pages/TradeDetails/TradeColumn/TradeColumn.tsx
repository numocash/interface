import { useMemo } from "react";
import tw, { css } from "twin.macro";

import {
  isLongLendgine,
  pickLongLendgines,
  pickShortLendgines,
} from "../../../../utils/lendgines";
import {
  nextHighestLendgine,
  nextLowestLendgine,
} from "../../../../utils/Numoen/price";
import { useTradeDetails } from "../TradeDetailsInner";
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
  const {
    trade,
    lendgines,
    base,
    setSelectedLendgine,
    selectedLendgine,
    close,
    price,
  } = useTradeDetails();

  const { longLendgine, shortLendgine } = useMemo(() => {
    const longLendgines = pickLongLendgines(lendgines, base);
    const shortLendgines = pickShortLendgines(lendgines, base);
    const nextLongLendgine = nextHighestLendgine({
      price,
      lendgines: longLendgines,
    });
    const nextShortLendgine = nextHighestLendgine({
      price: price.invert(),
      lendgines: shortLendgines,
    });
    const secondLongLendgine = nextLowestLendgine({
      price,
      lendgines: longLendgines,
    });
    const secondShortLendgine = nextLowestLendgine({
      price: price.invert(),
      lendgines: shortLendgines,
    });

    return {
      longLendgine: nextLongLendgine ?? secondLongLendgine,
      shortLendgine: nextShortLendgine ?? secondShortLendgine,
    };
  }, [base, lendgines, price]);

  const selectedLong = isLongLendgine(selectedLendgine, base);

  const Tabs = (
    <div tw="flex gap-4 text-sm items-center w-full col-start-2 col-span-5">
      {[longLendgine, shortLendgine].map((s) => {
        if (!s) return null;
        const isLong = isLongLendgine(s, base);

        return (
          <div key={s.address}>
            <button
              css={css`
                ${tw`text-xl font-semibold text-secondary`}
                ${tw`hover:(text-default) transform duration-300 ease-in-out`}
                ${isLong === selectedLong && tw`text-default`}
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
    <div tw="pl-6 lg:pl-8 xl:pl-12 transform ease-in-out duration-300 py-2 flex flex-col gap-4 w-full">
      {!close && Tabs}
      {(trade === TradeType.Long || trade === TradeType.Short) && <Trade />}
      <ProvideLiquidity />
      {!close && (
        <>
          <div tw="w-full border-b-2 border-gray-200" />
          <Returns />
        </>
      )}
      <div tw="w-full border-b-2 border-gray-200" />
      <TotalStats />
      <div tw="w-full border-b-2 border-gray-200" />
      <Config />
    </div>
  );
};
