import { Percent } from "@dahlia-labs/token-utils";
import { curveNatural } from "@visx/curve";
import { localPoint } from "@visx/event";
import type { EventType } from "@visx/event/lib/types";
import { GlyphCircle } from "@visx/glyph";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Line, LinePath } from "@visx/shape";
import { extent } from "d3-array";
import { useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import {
  useCurrentPrice,
  useMostLiquidMarket,
  usePriceHistory,
} from "../../../hooks/useExternalExchange";
import { sortTokens } from "../../../hooks/useUniswapPair";
import type { PricePoint } from "../../../services/graphql/uniswapV2";
import useWindowDimensions from "../../../utils/useWindowDimensions";
import { useTradeDetails } from ".";
import { EmptyChart } from "./EmptyChart";

export const Chart: React.FC = () => {
  const { denom, other, timeframe } = useTradeDetails();
  const referenceMarketQuery = useMostLiquidMarket([denom, other]);

  // TODO: bug with inverting
  const invertPriceQuery = sortTokens([denom, other])[1] === other;

  const priceHistoryQuery = usePriceHistory(
    referenceMarketQuery.data,
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

  const currentPriceQuery = useCurrentPrice(referenceMarketQuery.data);

  const currentPrice = useMemo(() => {
    if (!currentPriceQuery.data) return null;
    return invertPriceQuery
      ? currentPriceQuery.data.invert()
      : currentPriceQuery.data;
  }, [currentPriceQuery.data, invertPriceQuery]);

  const [crosshair, setCrosshair] = useState<number | null>(null);
  const [displayPrice, setDisplayPrice] = useState<PricePoint | null>(null);

  const priceChange = useMemo(() => {
    const secondPrice = displayPrice?.price ?? currentPrice;
    if (!secondPrice || !priceHistory) return null;

    const oneDayOldPrice = priceHistory[priceHistory.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    return Percent.fromFraction(
      secondPrice.subtract(oneDayOldPrice).divide(oneDayOldPrice)
    );
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
        p.price.asNumber,
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

  // update scale output ranges
  const windowDimensions = useWindowDimensions();
  const w = ((windowDimensions.width - 96) * 2) / 3 - 48;
  xScale.range([0, w]);
  yScale.range([178, 0]);

  const handleHover = useCallback(
    (event: Element | EventType) => {
      if (!priceHistory) return;

      // pixels
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x); // get timestamp from the scalex
      const index = priceHistory.reduce(
        (acc, cur, i) => (x0 < cur.timestamp ? i : acc),
        1
      );

      const d0 = priceHistory[index - 1];
      invariant(d0); // TODO: why does Uniswap not need this
      const d1 = priceHistory[index];
      let pricePoint = d0;

      const hasPreviousData = d1 && d1.timestamp;
      if (hasPreviousData) {
        pricePoint =
          x0.valueOf() - d0.timestamp.valueOf() <
          d1.timestamp.valueOf() - x0.valueOf()
            ? d1
            : d0;
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

  // return null;
  const loading = !priceHistory || !currentPrice || !priceChange;

  return (
    <div tw="col-span-2 w-full flex flex-col gap-12">
      <div tw="flex w-full">
        <div tw="flex gap-2 items-center">
          {loading ? (
            <div tw="bg-gray-200 animate-pulse h-8 w-20 rounded" />
          ) : (
            <p tw=" text-2xl">
              {displayPrice?.price.toSignificant(5, { groupSeparator: "," }) ??
                currentPrice.toSignificant(5, {
                  groupSeparator: ",",
                })}
            </p>
          )}
          {loading ? (
            <div tw="bg-gray-200 animate-pulse h-5 w-12 rounded" />
          ) : priceChange.greaterThan(0) ? (
            <p tw="text-green-500">+{priceChange.toFixed(2)}%</p>
          ) : (
            <p tw="text-red">{priceChange.toFixed(2)}%</p>
          )}
        </div>
      </div>
      {loading ? (
        <EmptyChart />
      ) : (
        <svg tw=" w-full h-48 justify-self-center col-span-2">
          <Group top={8}>
            <LinePath<
              NonNullable<ReturnType<typeof usePriceHistory>["data"]>[number]
            >
              curve={curveNatural}
              data={
                (priceHistory as NonNullable<
                  ReturnType<typeof usePriceHistory>["data"]
                >[number][]) ?? undefined
              }
              x={(d) => xScale(getX(d)) ?? 0}
              y={(d) => yScale(getY(d)) ?? 0}
              stroke={"#333"}
              strokeWidth={2}
              strokeOpacity={1}
            />
          </Group>
          <Line
            from={{ x: crosshair ? xScale(crosshair) : undefined, y: 0 }}
            to={{ x: crosshair ? xScale(crosshair) : undefined, y: 192 }}
            stroke={"#333"}
            strokeWidth={1}
            pointerEvents="none"
            strokeDasharray="4,4"
          />
          {crosshair && displayPrice && (
            <GlyphCircle
              left={xScale(crosshair)}
              top={yScale(getY(displayPrice)) + 8}
              size={50}
              fill={"#E5E5EA"}
              stroke={"#E5E5EA"}
              strokeWidth={0.5}
            />
          )}
          <rect
            x={0}
            y={0}
            width={w}
            height={192}
            fill="transparent"
            onTouchStart={handleHover}
            onTouchMove={handleHover}
            onMouseMove={handleHover}
            onMouseLeave={resetDisplay}
          />
        </svg>
      )}
    </div>
  );
};
