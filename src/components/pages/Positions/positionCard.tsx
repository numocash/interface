import type { IMarket } from "@dahlia-labs/numoen-utils";
import React, { useMemo } from "react";
import { useAccount } from "wagmi";

import {
  filterByMarket,
  sumMarket,
  useBurns,
  useMints,
  usePositionValue,
} from "../../../hooks/usePositions";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { Module } from "../../common/Module";
import { RowBetween } from "../../common/RowBetween";

interface Props {
  market: IMarket;
}

export const PositionCard: React.FC<Props> = ({ market }: Props) => {
  const { address } = useAccount();

  const positionValue = usePositionValue(address, market);

  const mints = useMints();
  const burns = useBurns();

  const marketMints = useMemo(
    () => (mints ? filterByMarket(mints, market) : null),
    [market, mints]
  );
  const marketBurns = useMemo(
    () => (burns ? filterByMarket(burns, market) : null),
    [burns, market]
  );

  const sumMints = useMemo(
    () => (marketMints ? sumMarket(marketMints, market) : null),
    [market, marketMints]
  );

  const sumBurns = useMemo(
    () => (marketBurns ? sumMarket(marketBurns, market) : null),
    [market, marketBurns]
  );

  return (
    <Module tw="">
      <RowBetween>
        <p>Market:</p>
        <p>{market.token.symbol}</p>
      </RowBetween>

      <RowBetween>
        <p>Position Value</p>
        {positionValue ? (
          <p>
            {positionValue.toSignificant(6)} {market.pair.baseToken.symbol}
          </p>
        ) : (
          <LoadingSpinner />
        )}
      </RowBetween>

      <RowBetween>
        <p>Cost Basis</p>
        {sumMints && sumBurns ? (
          <p>
            {sumMints.value.subtract(sumBurns.value).toSignificant(6)}{" "}
            {market.pair.baseToken.symbol}
          </p>
        ) : (
          <LoadingSpinner />
        )}
      </RowBetween>
    </Module>
  );
};
