import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";

import { useEnvironment } from "../../contexts/useEnvironment";

export function useInvalidateOnBlock({
  chainId,
  enabled,
  queryKey,
}: {
  chainId?: number;
  enabled?: boolean;
  queryKey: QueryKey;
}) {
  const queryClient = useQueryClient();
  const environment = useEnvironment();
  useBlockNumber({
    chainId,
    enabled,
    onBlock: enabled
      ? (blocknumber) =>
          blocknumber % environment.interface.blockFreq === 0 &&
          queryClient.invalidateQueries(queryKey)
      : undefined,
    scopeKey: enabled ? undefined : "idle",
  });
}
