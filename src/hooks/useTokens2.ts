import { Token } from "@dahlia-labs/token-utils";
import { chainID } from "@dahlia-labs/use-ethers";
import { AddressZero } from "@ethersproject/constants";
import { useQuery } from "@tanstack/react-query";
import type { TokenList } from "@uniswap/token-lists";
import axios from "axios";

import { useEnvironment } from "../contexts/environment2";
import type { HookArg } from "./useApproval";
import { useChain } from "./useChain";
import { dedupeTokens } from "./useTokens";

export const useDefaultTokenList = () => {
  const environment = useEnvironment();
  const chain = useChain();

  return useQuery<readonly Token[]>(
    ["token list", environment.interface.defaultActiveLists, chain],
    async () => {
      const lists = await Promise.all(
        environment.interface.defaultActiveLists.map((l) =>
          axios.get<TokenList>(l)
        )
      );
      return dedupeTokens(
        lists
          .flatMap((l) => l.data.tokens)
          .filter((t) => t.chainId === chainID[chain])
          .map((ti) => new Token(ti))
      );
    },
    { staleTime: Infinity }
  );
};

export const useMarketToken = (
  speculative: HookArg<Token>,
  symbol: HookArg<"+" | "-">
): Token | null => {
  const chain = useChain();
  if (!speculative || !symbol) return null;
  return new Token({
    name: "Numoen Replicating Derivative",
    chainId: chainID[chain],
    address: AddressZero,
    decimals: 18,
    symbol: speculative.symbol + symbol,
  });
};
