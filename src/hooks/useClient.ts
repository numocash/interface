import { GraphQLClient } from "graphql-request";
import { useMemo } from "react";

import { useEnvironment } from "../contexts/environment2";

const arbitrumClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev"
);

export const useClient = () => {
  const environment = useEnvironment();
  return useMemo(
    () => ({
      uniswapV2: new GraphQLClient(environment.interface.uniswapV2subgraph),
      uniswapV3: new GraphQLClient(environment.interface.uniswapV3subgraph),
    }),
    [
      environment.interface.uniswapV2subgraph,
      environment.interface.uniswapV3subgraph,
    ]
  );
};
