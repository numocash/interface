import { Percent } from "@dahlia-labs/token-utils";
import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { extent } from "d3-array";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import {
  sortTokens,
  useCurrentPrice,
  useMostLiquidMarket,
  usePriceHistory,
} from "../../../hooks/useUniswapPair";
import useWindowDimensions from "../../../utils/useWindowDimensions";
import { useTradeDetails } from ".";
import { EmptyChart } from "./EmptyChart";
import { Times } from "./TimeSelector";

export const Chart: React.FC = () => {
  const { denom, other } = useTradeDetails();
  const referenceMarketQuery = useMostLiquidMarket({ denom, other });

  const invertPriceQuery = sortTokens([denom, other])[0] === other;

  const priceHistoryQuery = usePriceHistory(
    referenceMarketQuery.data,
    Times.ONE_DAY,
    invertPriceQuery
  );

  const currentPriceQuery = useCurrentPrice(
    referenceMarketQuery.data,
    invertPriceQuery
  );

  const priceChange = useMemo(() => {
    if (!currentPriceQuery.data || !priceHistoryQuery.data) return null;

    const oneDayOldPrice =
      priceHistoryQuery.data[priceHistoryQuery.data.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    return Percent.fromFraction(
      currentPriceQuery.data.subtract(oneDayOldPrice).divide(oneDayOldPrice)
    );
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

  // return null;
  const loading =
    !priceHistoryQuery.data || !currentPriceQuery.data || !priceChange;

  const windowDimensions = useWindowDimensions();

  const w = ((windowDimensions.width - 96) * 2) / 3 - 48;
  // update scale output ranges
  xScale.range([0, w]);
  yScale.range([150, 0]);

  console.log(w);

  return (
    <div tw="col-span-2 w-full flex mt-2 flex-col gap-12">
      <div tw="flex w-full">
        <div tw="flex gap-2 items-center">
          <div tw="bg-gray-200 animate-pulse h-8 w-20 rounded" />
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
        <svg tw=" w-full h-40 justify-self-center col-span-2">
          <Group top={4}>
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
        </svg>
      )}
    </div>
  );
};
