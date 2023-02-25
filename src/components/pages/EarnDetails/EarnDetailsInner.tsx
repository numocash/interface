import type { Price } from "@uniswap/sdk-core";
import { useState } from "react";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { Lendgine } from "../../../constants/types";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import {
  pickLongLendgines,
  pickShortLendgines,
} from "../../../utils/lendgines";
import {
  nextHighestLendgine,
  nextLowestLendgine,
} from "../../../utils/Numoen/price";
import { PageMargin } from "../../layout";
import { History } from "./History/History";
import { Positions } from "./History/Positions/Positions";
import { Lendgines } from "./Lendgines";
import { Market } from "./Market";
import { TradeColumn } from "./TradeColumn/TradeColumn";

interface Props {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;
  lendgines: Lendgine[];
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
    <PageMargin tw="w-full pt-8">
      <div tw="w-full flex justify-center xl:(grid grid-cols-3)">
        <EarnDetailsProvider initialState={{ base, quote, lendgines, price }}>
          <div tw="w-full flex flex-col max-w-3xl gap-4 col-span-2 justify-self-center">
            <Market />
            <p tw="text-sm font-semibold text-headline">Select a pool</p>
            <Lendgines />
            <div tw="border-b-2 border-stroke" />

            <History />
            <Positions />
          </div>
          <div tw="flex max-w-sm justify-self-end">
            {/* TODO: stick to the right side */}
            <div tw="border-l-2 border-stroke sticky h-[75vh] min-h-[50rem] mt-[-44px] hidden xl:flex" />
            <TradeColumn tw="" />
          </div>
        </EarnDetailsProvider>
      </div>
    </PageMargin>
  );
};
