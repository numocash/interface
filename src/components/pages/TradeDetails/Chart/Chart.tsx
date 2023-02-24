import { Percent } from "@uniswap/sdk-core";
import { curveNatural } from "@visx/curve";
import { localPoint } from "@visx/event";
import type { EventType } from "@visx/event/lib/types";
import { GlyphCircle } from "@visx/glyph";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Line, LinePath } from "@visx/shape";
import { extent } from "d3-array";
import { useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import {
  useMostLiquidMarket,
  usePriceHistory,
} from "../../../../hooks/useExternalExchange";
import type { PricePoint } from "../../../../services/graphql/uniswapV2";
import {
  formatDisplayWithSoftLimit,
  formatPercent,
  formatPrice,
  fractionToFloat,
} from "../../../../utils/format";
import { priceToFraction } from "../../../../utils/Numoen/price";
import { useTradeDetails } from "../TradeDetailsInner";
import { EmptyChart } from "./EmptyChart";

export const Chart: React.FC = () => {
  const { base, quote, timeframe } = useTradeDetails();
  const referenceMarketQuery = useMostLiquidMarket([base, quote]);

  const invertPriceQuery = quote.sortsBefore(base);

  const priceHistoryQuery = usePriceHistory(
    referenceMarketQuery.data?.pool,
    timeframe
  );

  const priceHistory = useMemo(() => {
    if (!priceHistoryQuery.data) return null;
    return invertPriceQuery
      ? priceHistoryQuery.data.map((p) => ({
          ...p,
          price: p.price.invert(),
        }))
      : priceHistoryQuery.data;
  }, [invertPriceQuery, priceHistoryQuery.data]);

  const currentPrice = useMemo(() => {
    if (!referenceMarketQuery.data) return null;
    return invertPriceQuery
      ? referenceMarketQuery.data.price.invert()
      : referenceMarketQuery.data.price;
  }, [invertPriceQuery, referenceMarketQuery.data]);

  const [crosshair, setCrosshair] = useState<number | null>(null);
  const [displayPrice, setDisplayPrice] = useState<PricePoint | null>(null);

  const priceChange = useMemo(() => {
    const secondPrice =
      displayPrice?.price ??
      (currentPrice ? priceToFraction(currentPrice) : null);
    if (!secondPrice || !priceHistory) return null;

    const oneDayOldPrice = priceHistory[priceHistory.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    const f = secondPrice.subtract(oneDayOldPrice).divide(oneDayOldPrice);

    return new Percent(f.numerator, f.denominator);
  }, [currentPrice, displayPrice?.price, priceHistory]);

  const getX = useMemo(
    () =>
      (p: NonNullable<ReturnType<typeof usePriceHistory>["data"]>[number]) =>
        p.timestamp,
    []
  );

  const getY = useMemo(
    () =>
      (p: NonNullable<ReturnType<typeof usePriceHistory>["data"]>[number]) =>
        parseFloat(p.price.toFixed(10)),
    []
  );

  const xScale = scaleLinear<number>({
    domain: priceHistory
      ? (extent(priceHistory, getX) as [number, number])
      : [0, 0],
  });
  const yScale = scaleLinear<number>({
    domain: priceHistory
      ? (extent(priceHistory, getY) as [number, number])
      : [0, 0],
  });

  const handleHover = useCallback(
    (event: Element | EventType) => {
      if (!priceHistory) return;

      // pixels
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x); // get timestamp from the scalex
      // rounds down
      const index = priceHistory.reduce(
        (acc, cur, i) => (x0 < cur.timestamp ? i : acc),
        1
      );

      const d0 = priceHistory[index];
      invariant(d0); // TODO: why does Uniswap not need this
      const d1 = priceHistory[index - 1]; // next data in terms of timestamp
      let pricePoint = d0;

      const hasNextData = d1 && d1.timestamp;
      if (hasNextData) {
        pricePoint = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;
      }

      if (pricePoint) {
        setCrosshair(pricePoint.timestamp);
        setDisplayPrice(pricePoint);
      }
    },
    [priceHistory, xScale]
  );

  const resetDisplay = useCallback(() => {
    setCrosshair(null);
    setDisplayPrice(null);
  }, [setCrosshair]);

  const loading = !priceHistory || !currentPrice || !priceChange;

  return (
    <div tw="col-span-2 w-full flex flex-col gap-12">
      <div tw="flex w-full">
        <div tw="flex gap-2 items-center">
          {loading ? (
            <div tw="bg-secondary animate-pulse h-8 w-20 rounded" />
          ) : (
            <p tw="text-2xl">
              {displayPrice
                ? formatDisplayWithSoftLimit(
                    fractionToFloat(displayPrice.price),
                    4,
                    6,
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4,
                    }
                  )
                : formatPrice(currentPrice)}
            </p>
          )}
          {loading ? (
            <div tw="bg-secondary animate-pulse h-5 w-12 rounded" />
          ) : priceChange.greaterThan(0) ? (
            <p tw="text-green">+{formatPercent(priceChange)}</p>
          ) : (
            <p tw="text-red">{formatPercent(priceChange)}</p>
          )}
        </div>
      </div>
      {loading ? (
        <EmptyChart />
      ) : (
        <ParentSize style={{}}>
          {(parent) => {
            const marginTop = 15;
            xScale.range([0, parent.width]);
            yScale.range([208 - marginTop * 2, 0]);

            return (
              <svg tw="w-full h-52 justify-self-center col-span-2">
                <Group top={marginTop}>
                  <LinePath<
                    NonNullable<
                      ReturnType<typeof usePriceHistory>["data"]
                    >[number]
                  >
                    curve={curveNatural}
                    data={
                      (priceHistory as NonNullable<
                        ReturnType<typeof usePriceHistory>["data"]
                      >[number][]) ?? undefined
                    }
                    x={(d) => xScale(getX(d)) ?? 0}
                    y={(d) => yScale(getY(d)) ?? 0}
                    stroke={"#6246ea"}
                    strokeWidth={2}
                    strokeOpacity={1}
                  />
                </Group>
                {crosshair && (
                  <Line
                    from={{ x: xScale(crosshair), y: 0 }}
                    to={{ x: xScale(crosshair), y: 208 }}
                    stroke={"#d1d1e9"}
                    strokeWidth={1}
                    pointerEvents="none"
                    strokeDasharray="4,4"
                  />
                )}
                {crosshair && displayPrice && (
                  <GlyphCircle
                    left={xScale(crosshair)}
                    top={yScale(getY(displayPrice)) + marginTop}
                    size={50}
                    fill={"#6246ea"}
                    stroke={"#6246ea"}
                    strokeWidth={0.5}
                  />
                )}
                <rect
                  x={0}
                  y={0}
                  width={parent.width}
                  height={208}
                  fill="transparent"
                  onTouchStart={handleHover}
                  onTouchMove={handleHover}
                  onMouseMove={handleHover}
                  onMouseLeave={resetDisplay}
                />
              </svg>
            );
          }}
        </ParentSize>
      )}
    </div>
  );
};
