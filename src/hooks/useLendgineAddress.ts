import type { IMarket } from "../contexts/environment";

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
        m.pair.speculativeToken.address === lendgineProps.speculative &&
        m.pair.baseToken.address === lendgineProps.base &&
        m.pair.baseScaleFactor === lendgineProps.baseScaleFactor &&
        m.pair.speculativeScaleFactor ===
          lendgineProps.speculativeScaleFactor &&
        m.pair.bound.quotient.toString() === lendgineProps.upperBound
    ) ?? null
  );
};
