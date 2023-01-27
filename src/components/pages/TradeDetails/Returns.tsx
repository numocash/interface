import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { useMemo } from "react";

export const Returns: React.FC = () => {
  const min = -0.75;
  const max = 3;
  const points = 300;

  const baseReturns = new Array(points)
    .fill(null)
    .map((_, i) => ((max - min) * i) / points + min);
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

  return (
    <>
      <p tw="text-sm">Expected Profit and Loss</p>
      {/* height being set to 100% */}
      <ParentSize tw="" style={{}}>
        {(parent) => {
          xScale.range([0, parent.width]);
          yScale.range([90, 0]);
          return (
            <svg
              width={parent.width}
              height={100}
              tw="justify-self-center col-span-2"
            >
              <Group top={7}>
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
          );
        }}
      </ParentSize>
    </>
  );
};
