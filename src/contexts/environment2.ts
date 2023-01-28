import { createContainer } from "unstated-next";

import type { NumoenBaseConfig, NumoenInterfaceConfig } from "../constants";
import { config } from "../constants";
import { useChain } from "../hooks/useChain";

interface Environment {
  base: NumoenBaseConfig;
  // chain: NumoenChainConfig;
  interface: NumoenInterfaceConfig;
}

const useEnvironmentInternal = (): Environment => {
  const chain = useChain();
  return config[chain];
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
