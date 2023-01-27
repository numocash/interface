import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { useMemo } from "react";

export const Returns: React.FC = () => {
  const min = -75;
  const max = 300;

  const baseReturns = new Array(max - min).fill(null).map((_, i) => i + min);
  const optionReturns = (r: number) => r * r + 2 * r;

  const data: [number, number][] = baseReturns.map((b) => [
    b,
    optionReturns(b),
  ]);

  const getX = useMemo(() => (p: [number, number]) => p[0], []);
  const getY = useMemo(() => (p: [number, number]) => p[1], []);

  const xScale = scaleLinear<number>({
    domain: [min, max],
  });
  const yScale = scaleLinear<number>({
    domain: [
      Math.min(optionReturns(min), optionReturns(max)),
      Math.max(optionReturns(min), optionReturns(max)),
    ],
  });

  xScale.range([0, 200]);
  yScale.range([40, 0]);
  return (
    <>
      <p tw="text-sm">Expected Profit and Loss</p>
      <svg width={200} height={50} tw=" justify-self-center col-span-2">
        <Group top={8}>
          <LinePath<[number, number]>
            curve={curveNatural}
            data={data}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            stroke={"#333"}
            strokeWidth={2}
            strokeOpacity={1}
          />
        </Group>
      </svg>
    </>
  );
};
