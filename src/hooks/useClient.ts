import { GraphQLClient } from "graphql-request";

const arbitrumClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev"
);

export const useClient = () => {
  return {
    uniswapv3: arbitrumClient,
    sushiswap: new GraphQLClient(
      "https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup"
    ),
  };
};
