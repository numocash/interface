import type { IMarket } from "@dahlia-labs/numoen-utils";
import type { TokenAmount } from "@dahlia-labs/token-utils";
import { reservesMulticall } from "@dahlia-labs/uniswapv2-utils";
import invariant from "tiny-invariant";

import { useBlockMulticall } from "./useBlockQuery";

export const useUniswapPair = (
  market: IMarket | null
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
