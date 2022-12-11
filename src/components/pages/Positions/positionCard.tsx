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
import { PowerIcon } from "../../common/PowerIcon";

interface Props {
  market: IMarket;
}

export const PositionCard: React.FC<Props> = ({ market }: Props) => {
  const { address } = useAccount();

  const positionValue = usePositionValue(address, market);

  const show = useMemo(() => positionValue?.greaterThan(0), [positionValue]);

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

  return !show ? null : (
    <div tw="p-3 hover:bg-white bg-gray-100">
      <div tw="p-2 w-full items-center md:flex hidden">
        <div tw="w-60 min-w-max">
          <PowerIcon market={market} />
        </div>
        <p tw="text-lg font-semibold w-36 min-w-max">
          {positionValue ? (
            <p>
              {positionValue.toSignificant(4)}{" "}
              <span tw="font-normal text-sm text-secondary">
                {market.pair.baseToken.symbol}
              </span>
            </p>
          ) : (
            <LoadingSpinner />
          )}
        </p>
        <p tw="text-lg font-semibold w-36 min-w-max">
          {!returns ? (
            <LoadingSpinner />
          ) : returns.greaterThan(0) ? (
            <p tw="text-green-500">
              +{returns.toSignificant(3)}{" "}
              <span tw="font-normal text-sm text-secondary">
                {market.pair.baseToken.symbol}
              </span>
            </p>
          ) : (
            <p tw="text-red">
              -{returns.toSignificant(3)}{" "}
              <span tw="font-normal text-sm text-secondary">
                {market.pair.baseToken.symbol}
              </span>
            </p>
          )}
        </p>
        <div tw="gap-2 items-center flex flex-col w-36">
          <Button tw="w-full bg-green-500" variant="primary">
            <NavLink
              tw=""
              to={`/trade/?inputToken=${market.pair.speculativeToken.address}&outputToken=${market.token.address}`}
            >
              Add
            </NavLink>
          </Button>
          <Button tw="w-full bg-red" variant="primary">
            <NavLink
              tw=""
              to={`/trade/?inputToken=${market.token.address}&outputToken=${market.pair.speculativeToken.address}`}
            >
              Close
            </NavLink>
          </Button>
        </div>
      </div>
      <div tw="p-2 w-full justify-between items-center flex md:hidden h-full">
        <div tw="">
          <PowerIcon market={market} />
        </div>
        <div tw="flex flex-col items-center h-full justify-between gap-2">
          <p tw="text-lg font-semibold min-w-max flex items-center gap-1">
            {positionValue ? (
              <>
                {!returns ? null : returns.greaterThan(0) ? (
                  <p tw="text-green-500 text-sm">
                    (+{returns.toSignificant(3)})
                  </p>
                ) : (
                  <p tw="text-red text-sm">(-{returns.toSignificant(3)})</p>
                )}
                <p>
                  {positionValue.toSignificant(4)}{" "}
                  <span tw="font-normal text-sm text-secondary">
                    {market.pair.baseToken.symbol}
                  </span>
                </p>
              </>
            ) : (
              <LoadingSpinner />
            )}
          </p>

          <div tw="gap-2 items-center flex ">
            <NavLink
              tw="text-green-500 underline"
              to={`/trade/?inputToken=${market.pair.speculativeToken.address}&outputToken=${market.token.address}`}
            >
              Add
            </NavLink>
            <NavLink
              tw="text-red underline"
              to={`/trade/?inputToken=${market.token.address}&outputToken=${market.pair.speculativeToken.address}`}
            >
              Close
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
