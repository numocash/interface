import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";

import { graphQLClient } from "../../../AppWithProviders";
import { Explain } from "./Explain";
import { Filter } from "./Filter";
import { Loading } from "./Loading";
import { Sort } from "./Sort";

// query MyQuery {
//   pool(id: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640") {
//     poolHourData( orderBy: periodStartUnix, first:10, orderDirection:asc) {
//       token0Price
//       periodStartUnix
//     }
//   }
// }

interface PoolResFields {
  id: string;
  feeTier: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
  };
}

interface PoolRes {
  asAddress: PoolResFields[];
}

export const POOL_SEARCH = gql`
  query pools($id: String) {
    asAddress: pools(where: { id: $id }, subgraphError: allow) {
      id
      feeTier
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`;

export const Trade: React.FC = () => {
  const poolData = useQuery(["get graph"], async () => {
    const a = await graphQLClient.request<PoolRes>(POOL_SEARCH, {
      id: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
    });
    return a;
  });

  console.log(poolData?.data);
  return (
    <div tw="flex flex-col gap-4 w-full">
      <Explain />
      <p tw="text-xs text-default">
        Displaying <span tw="font-semibold">3 markets</span>
      </p>
      <div tw="flex gap-4">
        <Filter />
        <Sort />
      </div>

      {/* <SwapStateProvider>
        <Swap />
      </SwapStateProvider> */}

      <Loading />
    </div>
  );
};
