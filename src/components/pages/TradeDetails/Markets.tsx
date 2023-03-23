import type { CSSProperties } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { NavLink } from "react-router-dom";
import { useVirtual } from "react-virtual";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { useAllLendgines } from "../../../hooks/useAllLendgines";
import { lendgineToMarket } from "../../../lib/lendgineValidity";
import type { Market } from "../../../lib/types/market";
import { dedupe } from "../../../utils/dedupe";
import { Drop } from "../../common/Drop";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { Module } from "../../common/Module";
import { TokenIcon } from "../../common/TokenIcon";
import { useTradeDetails } from "./TradeDetailsInner";

export const Markets: React.FC = () => {
  const { base, quote } = useTradeDetails();
  const [show, setShow] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);

  const environment = useEnvironment();

  const lendgines = useAllLendgines();

  const markets = useMemo(() => {
    if (lendgines === null) return null;
    const markets = lendgines.map((l) =>
      lendgineToMarket(
        l,
        environment.interface.wrappedNative,
        environment.interface.specialtyMarkets
      )
    );

    const dedupedMarkets = dedupe(markets, (m) => m[0].address + m[1].address);

    return dedupedMarkets;
  }, [
    environment.interface.specialtyMarkets,
    environment.interface.wrappedNative,
    lendgines,
  ]);

  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"bottom-start"}
        tw=""
      >
        <Module tw="px-4 py-2 rounded-2xl border border-gray-200 gap-2 flex flex-col w-64">
          {!markets ? (
            <div tw="h-8 items-center flex justify-center">
              <LoadingSpinner tw="" />
            </div>
          ) : (
            <div tw="overflow-y-scroll flex-1 relative">
              <MarketsInner markets={markets} />
            </div>
          )}
        </Module>
      </Drop>
      <button
        ref={setTargetRef}
        onClick={() => setShow(true)}
        tw="flex items-center gap-3 "
      >
        <div tw="flex items-center space-x-[-0.5rem]">
          <TokenIcon token={quote} size={32} />
          <TokenIcon token={base} size={32} />
        </div>
        <p tw="text-lg sm:text-2xl font-bold">
          {quote.symbol} / {base.symbol}
        </p>
        <IoIosArrowDown tw="text-lg sm:text-2xl font-bold" />
      </button>
    </>
  );
};

interface InnerProps {
  markets: readonly Market[];
}

const MarketsInner: React.FC<InnerProps> = ({ markets }: InnerProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtual({
    paddingStart: 0,
    paddingEnd: 0,
    size: markets.length,
    parentRef,
    estimateSize: useCallback(() => 48, []),
    overscan: 0,
  });

  const Row = useCallback(
    ({
      market,
      style,
    }: {
      market: Market | undefined;
      style: CSSProperties;
    }) => {
      if (!market) return null;

      return (
        <NavLink
          to={`/trade/details/${market[0].address}/${market[1].address}`}
          tw="flex items-center gap-3 h-8"
          style={style}
        >
          <div tw="flex items-center space-x-[-0.5rem]">
            <TokenIcon token={market[1]} size={26} />
            <TokenIcon token={market[0]} size={26} />
          </div>
          <p tw="text-lg sm:text-lg font-bold">
            {market[1].symbol} / {market[0].symbol}
          </p>
        </NavLink>
      );
    },
    []
  );

  return (
    <div tw="overflow-auto h-full w-full" ref={parentRef}>
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => (
          <Row
            key={virtualRow.index}
            market={markets[virtualRow.index]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
