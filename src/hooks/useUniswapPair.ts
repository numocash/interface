import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { reservesMulticall } from "@dahlia-labs/uniswapv2-utils";
import invariant from "tiny-invariant";

import type { HookArg } from "./useApproval";
import { useBlockMulticall } from "./useBlockQuery";

export const sortTokens = (
  tokens: readonly [Token, Token]
): readonly [Token, Token] =>
  tokens[0].address < tokens[1].address ? tokens : [tokens[1], tokens[0]];

// Returns data in base, speculative
export const useUniswapPair = (
  market: HookArg<IMarket>
): [TokenAmount, TokenAmount] | null => {
  const data = useBlockMulticall(
    market ? [reservesMulticall(market.referenceMarket)] : null
  );

  if (!data) return null;
  invariant(market);

  const baseFirst =
    market.pair.baseToken.address < market.pair.speculativeToken.address;

  return [
    baseFirst ? data[0][0] : data[0][1],
    baseFirst ? data[0][1] : data[0][0],
  ];
};
