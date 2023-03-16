import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  plugins: [
    foundry({
      project: "./lib/numoen-contracts",
    }),
    react({
      useContractEvent: false,
      useContractFunctionRead: false,
      useContractItemEvent: false,
      useContractRead: false,
    }),
  ],
});
