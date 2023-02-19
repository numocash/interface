import { defineConfig } from "@wagmi/cli";
import { actions, foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  plugins: [
    foundry({
      project: "./lib/numoen-contracts",
    }),
    actions(),
    react(),
  ],
});
