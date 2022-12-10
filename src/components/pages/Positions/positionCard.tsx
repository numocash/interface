import type { IMarket } from "@dahlia-labs/numoen-utils";
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAccount } from "wagmi";

import {
  filterByMarket,
  sumMarket,
  useBurns,
  useMints,
  usePositionValue,
} from "../../../hooks/usePositions";
import { Button } from "../../common/Button";
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

  const returns = useMemo(() => {
    const sumMints = marketMints ? sumMarket(marketMints, market) : null;
    const sumBurns = marketBurns ? sumMarket(marketBurns, market) : null;

    return positionValue && sumMints && sumBurns
      ? positionValue.add(sumBurns.value).subtract(sumMints.value)
      : null;
  }, [market, marketBurns, marketMints, positionValue]);

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
        <p>Total returns</p>
        {returns ? (
          <p>
            {returns.toSignificant(6)} {market.pair.baseToken.symbol}
          </p>
        ) : (
          <LoadingSpinner />
        )}
      </RowBetween>

      <Button variant="primary">
        <NavLink
          tw=""
          to={`/trade/?inputToken=${market.pair.speculativeToken.address}&outputToken=${market.token.address}`}
        >
          Add to position
        </NavLink>
      </Button>

      <Button variant="primary">
        <NavLink
          tw=""
          to={`/trade/?inputToken=${market.token.address}&outputToken=${market.pair.speculativeToken.address}`}
        >
          Close position
        </NavLink>
      </Button>
    </Module>
  );
};
