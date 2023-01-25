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

import type { PricePoint } from "../../../hooks/useUniswapPair";
import {
  sortTokens,
  useCurrentPrice,
  useMostLiquidMarket,
  usePriceHistory,
} from "../../../hooks/useUniswapPair";
import useWindowDimensions from "../../../utils/useWindowDimensions";
import { useTradeDetails } from ".";
import { EmptyChart } from "./EmptyChart";

export const Chart: React.FC = () => {
  const { denom, other, timeframe } = useTradeDetails();
  const referenceMarketQuery = useMostLiquidMarket({ denom, other });

  const invertPriceQuery = sortTokens([denom, other])[0] === other;

  const priceHistoryQuery = usePriceHistory(
    referenceMarketQuery.data,
    timeframe,
    invertPriceQuery
  );

  const currentPriceQuery = useCurrentPrice(
    referenceMarketQuery.data,
    invertPriceQuery
  );

  const [crosshair, setCrosshair] = useState<number | null>(null);
  const [displayPrice, setDisplayPrice] = useState<PricePoint | null>(null);

  const priceChange = useMemo(() => {
    const secondPrice = displayPrice?.price ?? currentPriceQuery.data;
    if (!secondPrice || !priceHistoryQuery.data) return null;

    const oneDayOldPrice =
      priceHistoryQuery.data[priceHistoryQuery.data.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    return Percent.fromFraction(
      secondPrice.subtract(oneDayOldPrice).divide(oneDayOldPrice)
    );
  }, [currentPriceQuery.data, displayPrice?.price, priceHistoryQuery.data]);

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
    domain: priceHistoryQuery.data
      ? (extent(priceHistoryQuery.data, getX) as [number, number])
      : [0, 0],
  });
  const yScale = scaleLinear<number>({
    domain: priceHistoryQuery.data
      ? (extent(priceHistoryQuery.data, getY) as [number, number])
      : [0, 0],
  });

  // update scale output ranges
  const windowDimensions = useWindowDimensions();
  const w = ((windowDimensions.width - 96) * 2) / 3 - 48;
  xScale.range([0, w]);
  yScale.range([178, 0]);

  const handleHover = useCallback(
    (event: Element | EventType) => {
      if (!priceHistoryQuery.data) return;

      // pixels
      const { x } = localPoint(event) || { x: 0 };
      // console.log(x, priceHistoryQuery.data.length);
      const x0 = xScale.invert(x); // get timestamp from the scalexw
      const index = priceHistoryQuery.data.reduce(
        (acc, cur, i) => (x0 < cur.timestamp ? i : acc),
        0
      );

      const d0 = priceHistoryQuery.data[index - 1];
      invariant(d0); // TODO: why does Uniswap not need this
      const d1 = priceHistoryQuery.data[index];
      let pricePoint = d0;

      const hasPreviousData = d1 && d1.timestamp;
      if (hasPreviousData) {
        pricePoint =
          x0.valueOf() - d0.timestamp.valueOf() >
          d1.timestamp.valueOf() - x0.valueOf()
            ? d1
            : d0;
      }

      if (pricePoint) {
        setCrosshair(pricePoint.timestamp);
        setDisplayPrice(pricePoint);
      }
    },
    [priceHistoryQuery.data, xScale]
  );

  const resetDisplay = useCallback(() => {
    setCrosshair(null);
    setDisplayPrice(null);
  }, [setCrosshair]);

  // return null;
  const loading =
    !priceHistoryQuery.data || !currentPriceQuery.data || !priceChange;

  return (
    <div tw="col-span-2 w-full flex flex-col gap-12">
      <div tw="flex w-full">
        <div tw="flex gap-2 items-center">
          {loading ? (
            <div tw="bg-gray-200 animate-pulse h-8 w-20 rounded" />
          ) : (
            <p tw=" text-2xl">
              {displayPrice?.price.toSignificant(5, { groupSeparator: "," }) ??
                currentPriceQuery.data?.toSignificant(5, {
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
              data={priceHistoryQuery.data ?? undefined}
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
          <GlyphCircle
            left={crosshair ? xScale(crosshair) : undefined}
            top={displayPrice ? yScale(getY(displayPrice)) + 8 : undefined}
            size={50}
            fill={"#333"}
            stroke={"#333"}
            strokeWidth={0.5}
          />
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
