import { GraphQLClient } from "graphql-request";
import { useMemo } from "react";

import { useEnvironment } from "../contexts/environment2";

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
