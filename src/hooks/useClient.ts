import { GraphQLClient } from "graphql-request";

const arbitrumClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev"
);

export const useClient = (): GraphQLClient => {
  return arbitrumClient;
};
