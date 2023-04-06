import type { Price } from "@uniswap/sdk-core";
import { useState } from "react";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import { pickLongLendgines, pickShortLendgines } from "../../../lib/lendgines";
import { nextHighestLendgine, nextLowestLendgine } from "../../../lib/price";
import type { Lendgine } from "../../../lib/types/lendgine";
import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import { History } from "./History/History";
import { Lendgines } from "./Lendgines";
import { Market } from "./Market";
import { Config } from "./TradeColumn/Config";
import { TradeColumn } from "./TradeColumn/TradeColumn";

interface Props {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;
  lendgines: readonly Lendgine[];
  price: Price<WrappedTokenInfo, WrappedTokenInfo>;
}

interface IEarnDetails {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;

  selectedLendgine: Lendgine;
  setSelectedLendgine: (val: Lendgine) => void;

  close: boolean;
  setClose: (val: boolean) => void;

  lendgines: readonly Lendgine[];
  price: Price<WrappedTokenInfo, WrappedTokenInfo>;
}

const useEarnDetailsInternal = ({
  base,
  quote,
  lendgines,
  price,
}: Partial<Props> = {}): IEarnDetails => {
  invariant(base && quote && lendgines && price);
  const [close, setClose] = useState(false);

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

  const lendgine =
    nextLongLendgine ??
    secondLongLendgine ??
    nextShortLendgine ??
    secondShortLendgine;
  invariant(lendgine);

  const [selectedLendgine, setSelectedLendgine] = useState<Lendgine>(lendgine);

  return {
    base,
    quote,
    lendgines,
    selectedLendgine,
    setSelectedLendgine,
    close,
    setClose,
    price,
  };
};

export const { Provider: EarnDetailsProvider, useContainer: useEarnDetails } =
  createContainer(useEarnDetailsInternal);

export const EarnDetailsInner: React.FC<Props> = ({
  base,
  quote,
  lendgines,
  price,
}: Props) => {
  return (
    <EarnDetailsProvider initialState={{ base, quote, lendgines, price }}>
      <div tw="w-full max-w-7xl grid lg:(grid-cols-3) gap-2">
        <div tw="lg:col-span-2 w-full flex flex-col gap-2 bg-white border rounded-xl border-[#dfdfdf] p-6 shadow">
          <Market />
          <p tw="text-sm font-semibold text-headline">Select a pool</p>
          <Lendgines />
        </div>
        <TradeColumn tw="w-full" />
      </div>
      <div tw="w-full max-w-7xl flex flex-col lg:(grid grid-cols-3) gap-2">
        <History />
        <Config />
      </div>
    </EarnDetailsProvider>
  );
};
