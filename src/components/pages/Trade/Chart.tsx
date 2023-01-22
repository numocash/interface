import { getAddress } from "@ethersproject/address";
import { useQuery } from "@tanstack/react-query";
import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleTime } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { extent } from "d3-array";
import { gql } from "graphql-request";
import { useMemo } from "react";

import { graphQLClient } from "../../../AppWithProviders";
import { EmptyChart } from "./EmptyChart";

// TODO: use Uniswap tools to generate schema

type PoolResFields = {
  pool: { poolHourData: { token0Price: string; periodStartUnix: string }[] };
};

const POOL_SEARCH = gql`
  query pool($id: String) {
    pool(id: $id, subgraphError: allow) {
      poolHourData(orderBy: periodStartUnix, first: 24, orderDirection: desc) {
        token0Price
        periodStartUnix
      }
    }
  }
`;

export const Chart: React.FC = () => {
  const address = getAddress("0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640");

  const poolData = useQuery(["get graph"], async () => {
    return await graphQLClient.request<PoolResFields>(POOL_SEARCH, {
      id: address.toLowerCase(),
    });
  });

  const getX = useMemo(
    () => (p: PoolResFields["pool"]["poolHourData"][number]) =>
      parseInt(p.periodStartUnix),
    []
  );

  const getY = useMemo(
    () => (p: PoolResFields["pool"]["poolHourData"][number]) =>
      parseFloat(p.token0Price),
    []
  );

  const xScale = scaleTime<number>({
    domain: poolData.data
      ? (extent(poolData.data?.pool.poolHourData, getX) as [number, number])
      : [0, 0],
  });
  const yScale = scaleTime<number>({
    domain: poolData.data
      ? (extent(poolData.data?.pool.poolHourData, getY) as [number, number])
      : [0, 0],
  });

  // update scale output ranges
  xScale.range([0, 350]);
  yScale.range([200, 0]);

  return (
    <>
      <svg width={400} height={200} tw="w-full">
        <Group top={100}>
          <LinePath<PoolResFields["pool"]["poolHourData"][number]>
            curve={curveNatural}
            data={poolData.data?.pool.poolHourData}
            x={(d) => xScale(getX(d)) ?? 0}
            y={(d) => yScale(getY(d)) ?? 0}
            stroke="#333"
            strokeWidth={1}
            strokeOpacity={1}
          />
        </Group>
      </svg>
      <EmptyChart />
    </>
  );
};
