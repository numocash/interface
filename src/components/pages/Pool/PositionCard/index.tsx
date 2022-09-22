import React from "react";
import { NavLink } from "react-router-dom";

import type { IMarket } from "../../../../contexts/environment";
import { Button } from "../../../common/Button";
import { Module } from "../../../common/Module";
import { Payoff } from "../../../common/Payoff";
import { RowBetween } from "../../../common/RowBetween";
import { Amounts } from "./Amount";

interface Props {
  market: IMarket;
}

export const PositionCard: React.FC<Props> = ({ market }: Props) => {
  const { bound, speculativeToken } = market.pair;

  return (
    <Module tw="flex w-full max-w-2xl pb-0">
      <div tw="flex gap-6 flex-col md:flex-row w-full">
        <div tw="flex flex-col w-full">
          <RowBetween>
            <p tw="text-black font-bold text-xl">sq{speculativeToken.symbol}</p>
            <p tw="text-black">
              Bound: {bound.toFixed(2)} {bound.baseCurrency.symbol} /{" "}
              {bound.quoteCurrency.symbol}
            </p>
          </RowBetween>
          <Amounts market={market} />
        </div>

        <div tw="flex flex-col w-full">
          <RowBetween tw="gap-4">
            <NavLink tw="w-full" to={"/pool/add-position/" + market.address}>
              <Button tw="w-full" variant="primary">
                Add
              </Button>
            </NavLink>
            <NavLink tw="w-full" to={"/pool/remove-position/" + market.address}>
              <Button tw="w-full" variant="primary">
                Remove
              </Button>
            </NavLink>
          </RowBetween>
          <Payoff bound={bound} />
        </div>
      </div>
    </Module>
  );
};
