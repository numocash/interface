import type { IMarket } from "@dahlia-labs/numoen-utils";

import { scale } from "../components/pages/Trade/useTrade";

interface LendgineProps {
  base: string;
  speculative: string;
  baseScaleFactor: number;
  speculativeScaleFactor: number;
  upperBound: string;
}

export const lendgineAddress = (
  lendgineProps: LendgineProps | null,
  markets: readonly IMarket[]
): IMarket | null => {
  if (!lendgineProps) return null;
  return (
    markets.find(
      (m) =>
        m.pair.speculativeToken.address.toLowerCase() ===
          lendgineProps.speculative.toLowerCase() &&
        m.pair.baseToken.address.toLowerCase() ===
          lendgineProps.base.toLowerCase() &&
        m.pair.baseScaleFactor === lendgineProps.baseScaleFactor &&
        m.pair.speculativeScaleFactor ===
          lendgineProps.speculativeScaleFactor &&
        m.pair.bound.asFraction.multiply(scale).quotient.toString() ===
          lendgineProps.upperBound
    ) ?? null
  );
};
