import Chart from "react-apexcharts";

import type { ITickInfo } from "../../../../contexts/environment";
import { useTicks } from "../../../../hooks/useLendgine";
import { scale } from "../../Trade/useTrade";
import { useCreatePair } from ".";
import { InterestDisplay } from "./InterestDisplay";

export const InterestRate: React.FC = () => {
  const { market, setTick } = useCreatePair();

  const ticksInfo = useTicks(market);

  const data = ticksInfo?.reduce((acc: [number, number][], cur: ITickInfo) => {
    const lastTick = acc.at(-1);
    const newZeros = new Array(cur.tick - (lastTick ? lastTick[0] + 1 : 1))
      .fill(null)
      .map(
        (_, j) => [j + (lastTick ? lastTick[0] + 1 : 1), 0] as [number, number]
      );
    const newData = [
      cur.tick,
      cur.liquidity.asFraction.divide(scale).asNumber,
    ] as [number, number];

    return acc.concat(newZeros).concat([newData]);
  }, []);

  const options = {
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "90%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    chart: {
      toolbar: { show: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          setTick(config.dataPointIndex + 1);
        },
      },
    },
    tooltip: {
      enabled: false,
    },
    xaxis: {
      type: "numeric",
      title: {
        text: "APR",
        offsetX: 0,
        offsetY: 0,
        style: {
          color: undefined,
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 600,
          cssClass: "apexcharts-xaxis-title",
        },
      },
    },
    yaxis: {
      title: {
        text: "Amount liquidity",
        offsetX: 0,
        offsetY: 0,
        style: {
          color: undefined,
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 600,
          cssClass: "apexcharts-xaxis-title",
        },
      },
      labels: {
        formatter: (value: number) => value.toFixed(2),
      },
    },
    grid: { show: true },
    legend: {
      show: false,
    },
    stroke: {
      curve: "smooth",
    },
  };

  const series = [
    {
      data,
    },
  ];

  return (
    <div tw="rounded-xl overflow-hidden bg-white shadow-2xl flex w-full flex-col ">
      <div tw="px-6 h-[98px] flex py-3  flex-col justify-between bg-[#EDEEEF]">
        <>
          <p tw="text-xl font-semibold text-black">Select an interest rate</p>
          <p tw="text-default">
            This is the rate you agree to lend out your liquidity. Unutilized
            liquidity earns nothing.
          </p>
        </>
      </div>
      <div tw="p-3">
        <Chart
          tw="flex justify-center"
          options={options}
          series={series}
          type="bar"
          width="380"
          grid
        />
        <InterestDisplay />
      </div>
    </div>
  );
};
