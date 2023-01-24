import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleTime } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { extent } from "d3-array";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import type {
  useCurrentPrice,
  usePriceHistory,
} from "../../../hooks/useUniswapPair";

interface Props {
  priceHistoryQuery: ReturnType<typeof usePriceHistory>;
  currentPriceQuery: ReturnType<typeof useCurrentPrice>;
}

export const MiniChart: React.FC<Props> = ({
  priceHistoryQuery,
  currentPriceQuery,
}: Props) => {
  const gain = useMemo(() => {
    if (!priceHistoryQuery.data || !currentPriceQuery.data) return null;

    const oneDayOldPrice =
      priceHistoryQuery.data[priceHistoryQuery.data.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    return currentPriceQuery.data.greaterThan(oneDayOldPrice);
  }, [currentPriceQuery.data, priceHistoryQuery.data]);

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

  const xScale = scaleTime<number>({
    domain: priceHistoryQuery.data
      ? (extent(priceHistoryQuery.data, getX) as [number, number])
      : [0, 0],
  });
  const yScale = scaleTime<number>({
    domain: priceHistoryQuery.data
      ? (extent(priceHistoryQuery.data, getY) as [number, number])
      : [0, 0],
  });

  // update scale output ranges
  xScale.range([0, 100]);
  yScale.range([40, 0]);

  return (
    <svg width={100} height={50} tw="justify-self-center col-span-2">
      <Group top={5}>
        <LinePath<
          NonNullable<ReturnType<typeof usePriceHistory>["data"]>[number]
        >
          curve={curveNatural}
          data={priceHistoryQuery.data ?? undefined}
          x={(d) => xScale(getX(d)) ?? 0}
          y={(d) => yScale(getY(d)) ?? 0}
          stroke={
            gain === true ? "#00C55E" : gain === false ? "#FF4941" : "#000"
          }
          strokeWidth={2}
          strokeOpacity={1}
        />
      </Group>
    </svg>
  );
};
