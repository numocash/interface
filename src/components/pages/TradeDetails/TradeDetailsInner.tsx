import type { Price } from "@uniswap/sdk-core";
import { Percent } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";
import { useAccount } from "wagmi";

import { useBalance } from "../../../hooks/useBalance";
import { isV3, useMostLiquidMarket } from "../../../hooks/useExternalExchange";
import { useLendgine } from "../../../hooks/useLendgine";
import { ONE_HUNDRED_PERCENT } from "../../../lib/constants";
import {
  accruedLendgineInfo,
  getT,
  liquidityPerCollateral,
  liquidityPerShare,
} from "../../../lib/lendgineMath";
import {
  isLongLendgine,
  isShortLendgine,
  pickLongLendgines,
  pickShortLendgines,
} from "../../../lib/lendgines";
import { nextHighestLendgine, nextLowestLendgine } from "../../../lib/price";
import type { Lendgine } from "../../../lib/types/lendgine";
import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import { Button } from "../../common/Button";
import { PageMargin } from "../../layout";
import { Times } from "./Chart/TimeSelector";
import { MainView } from "./MainView";
import { TradeColumn, TradeType } from "./TradeColumn/TradeColumn";

interface Props {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;
  lendgines: Lendgine[];
  price: Price<WrappedTokenInfo, WrappedTokenInfo>;
}

interface ITradeDetails {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;

  timeframe: Times;
  setTimeframe: (val: Times) => void;

  trade: TradeType;
  setTrade: (val: TradeType) => void;

  selectedLendgine: Lendgine;
  setSelectedLendgine: (val: Lendgine) => void;

  close: boolean;
  setClose: (val: boolean) => void;

  lendgines: readonly Lendgine[];
  price: Price<WrappedTokenInfo, WrappedTokenInfo>;

  modalOpen: boolean;
  setModalOpen: (val: boolean) => void;
}

const useTradeDetailsInternal = ({
  base,
  quote,
  lendgines,
  price,
}: Partial<Props> = {}): ITradeDetails => {
  invariant(base && quote && lendgines && price);
  const [timeframe, setTimeframe] = useState<Times>(Times.ONE_DAY);
  const [trade, setTrade] = useState<TradeType>(TradeType.Long);
  const [close, setClose] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

    timeframe,
    setTimeframe,

    selectedLendgine,
    setSelectedLendgine,

    trade,
    setTrade,

    close,
    setClose,

    lendgines,
    price,

    modalOpen,
    setModalOpen,
  };
};

export const useNextLendgines = () => {
  const { lendgines, base, price } = useTradeDetails();
  return useMemo(() => {
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
};

export const { Provider: TradeDetailsProvider, useContainer: useTradeDetails } =
  createContainer(useTradeDetailsInternal);

export const usePositionValue = (lendgine: Lendgine) => {
  const { address } = useAccount();
  const { price: referencePrice, base, quote } = useTradeDetails();
  const t = getT();
  const mostLiquidQuery = useMostLiquidMarket([base, quote]);

  const balanceQuery = useBalance(lendgine.lendgine, address);
  const lendgineInfoQuery = useLendgine(lendgine);

  const { value } = useMemo(() => {
    if (!balanceQuery.data || !lendgineInfoQuery.data || !mostLiquidQuery.data)
      return {};

    const updatedLendgineInfo = accruedLendgineInfo(
      lendgine,
      lendgineInfoQuery.data,
      t
    );

    // liq
    const liquidity = liquidityPerShare(lendgine, updatedLendgineInfo).quote(
      balanceQuery.data
    );

    // token1
    const collateral = liquidityPerCollateral(lendgine)
      .invert()
      .quote(liquidity);

    const token0Amount = updatedLendgineInfo.reserve0
      .multiply(liquidity)
      .divide(updatedLendgineInfo.totalLiquidity);
    const token1Amount = updatedLendgineInfo.reserve1
      .multiply(liquidity)
      .divide(updatedLendgineInfo.totalLiquidity);

    // token0 / token1
    const referencePriceAdjusted = isShortLendgine(lendgine, base)
      ? referencePrice.invert()
      : referencePrice;

    const dexFee = isV3(mostLiquidQuery.data.pool)
      ? new Percent(mostLiquidQuery.data.pool.feeTier, "1000000")
      : new Percent("3000", "1000000");

    // token1
    const debtValue = token1Amount.add(
      referencePriceAdjusted
        .invert()
        .quote(token0Amount)
        .multiply(ONE_HUNDRED_PERCENT.add(dexFee))
    );

    const value = collateral.subtract(debtValue);

    return { value };
  }, [
    balanceQuery.data,
    base,
    lendgine,
    lendgineInfoQuery.data,
    mostLiquidQuery.data,
    referencePrice,
    t,
  ]);

  return value;
};

export const TradeDetailsInner: React.FC<Props> = ({
  base,
  quote,
  lendgines,
  price,
}: Props) => {
  return (
    <TradeDetailsProvider initialState={{ base, quote, lendgines, price }}>
      <TradeDetailsInnerInner />
    </TradeDetailsProvider>
  );
};

const TradeDetailsInnerInner: React.FC = () => {
  const { base, setSelectedLendgine, setModalOpen } = useTradeDetails();
  const { longLendgine, shortLendgine } = useNextLendgines();

  const Buttons = (
    <div tw="gap-2 items-center flex sm:hidden ">
      {[longLendgine, shortLendgine].map((s) => {
        if (!s) return null;
        const isLong = isLongLendgine(s, base);

        return (
          <div key={s.address}>
            <Button
              variant="primary"
              tw="h-8 text-xl font-semibold"
              onClick={() => {
                setSelectedLendgine(s);
                setModalOpen(true);
              }}
            >
              {isLong ? "Long" : "Short"}
            </Button>
          </div>
        );
      })}
    </div>
  );
  return (
    <>
      <PageMargin tw="w-full pb-12 sm:pb-0">
        <div tw="w-full flex justify-center xl:(grid grid-cols-3)">
          <MainView />
          <div tw="flex max-w-sm justify-self-end">
            <div tw="border-l-2 border-stroke sticky h-[75vh] min-h-[50rem] mt-[-44px] hidden xl:flex" />
            <TradeColumn tw="" />
          </div>
        </div>
      </PageMargin>
      <div tw="z-10 sticky bottom-16 border-t-2 border-stroke  bg-background  sm:(hidden) w-full flex items-center px-4 py-2 pb-3 justify-end">
        {Buttons}
      </div>
    </>
  );
};
