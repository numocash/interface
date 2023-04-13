import axios from "axios";
import Vibrant from "node-vibrant";
import { useQuery } from "wagmi";

import type { WrappedTokenInfo } from "../lib/types/wrappedTokenInfo";

export const useTokenColor = (token: WrappedTokenInfo) => {
  return useQuery(
    ["tokenColor", token.address, token.chainId],
    async () => {
      const { data: iconData } = await axios.get<Buffer>(token.logoURI!, {
        responseType: "arraybuffer",
      });
      return await Vibrant.from(iconData).getPalette();
    },
    { enabled: !!token.logoURI, staleTime: Infinity }
  );
};
