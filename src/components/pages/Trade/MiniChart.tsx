import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { extent } from "d3-array";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import type {
  useCurrentPrice,
  usePriceHistory,
} from "../../../hooks/useExternalExchange";

interface Props {
  priceHistory: NonNullable<ReturnType<typeof usePriceHistory>["data"]>;
  currentPrice: NonNullable<ReturnType<typeof useCurrentPrice>["data"]>;
}

export const MiniChart: React.FC<Props> = ({
  priceHistory,
  currentPrice,
}: Props) => {
  const gain = useMemo(() => {
    const oneDayOldPrice = priceHistory[priceHistory.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    return currentPrice.greaterThan(oneDayOldPrice);
  }, [currentPrice, priceHistory]);

  const getX = useMemo(
    () => (p: Props["priceHistory"][number]) => p.timestamp,
    []
  );

  const getY = useMemo(
    () => (p: Props["priceHistory"][number]) => parseFloat(p.price.toFixed(10)),
    []
  );

  const xScale = scaleLinear<number>({
    domain: extent(priceHistory, getX) as [number, number],
  });
  const yScale = scaleLinear<number>({
    domain: extent(priceHistory, getY) as [number, number],
  });

  // update scale output ranges
  xScale.range([0, 100]);
  yScale.range([40, 0]);

  return (
    <svg width={100} height={50} tw="justify-self-center col-span-2">
      <Group top={5}>
        <LinePath<Props["priceHistory"][number]>
          curve={curveNatural}
          data={(priceHistory as Props["priceHistory"][number][]) ?? undefined}
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
