import type { Price } from "@dahlia-labs/token-utils";
import Chart from "react-apexcharts";

interface Props {
  bound: Price | null;
}

export const LongPayoff: React.FC<Props> = ({ bound }) => {
  const b = bound ? bound.asNumber : 0;

  const end = 3.5;

  const ticks = 100;

  const x = [...Array(ticks + 1).keys()].map((x) => x / (ticks / end));

  const a = 2 * b;

  const f: (x: number) => number = (i) => i ** 2;
  const g: (x: number) => number = (i) => 2 * (b - i);

  const d = x.map(
    (i) => [i, a * i - (i < b ? f(i) + i * g(i) : b ** 2)] as [number, number]
  );
  const options = {
    chart: {
      toolbar: { show: false },
    },
    tooltip: {
      enabled: false,
    },
    xaxis: {
      type: "numeric",
      title: {
        text: "cUSD / CELO",
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
        text: "Position value in cUSD",
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
      data: d,
    },
  ];
  return (
    <Chart options={options} series={series} type="line" width="400" grid />
  );
};
