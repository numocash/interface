import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  generates: {
    "./src/gql/uniswapV2/": {
      schema:
        "https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup",
      documents: "src/services/graphql/uniswapV2.ts",
      preset: "client",
      plugins: [],
    },
    "./src/gql/uniswapV3/": {
      schema: "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev",
      documents: "src/services/graphql/uniswapV3.ts",
      preset: "client",
      plugins: [],
    },
  },
};
export default config;
