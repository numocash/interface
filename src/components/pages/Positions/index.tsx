import React, { useMemo } from "react";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../contexts/environment";
import { useBurns, useMints } from "../../../hooks/usePositions";
import { useTokenBalances } from "../../../hooks/useTokenBalance";
import { LoadingPage } from "../../common/LoadingPage";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { Module } from "../../common/Module";
import { PositionCard } from "./positionCard";

export const Portfolio: React.FC = () => {
  const { markets } = useEnvironment();
  const { address } = useAccount();

  const balances = useTokenBalances(
    markets.map((m) => m.token),
    address
  );

  const { empty, loading } = useMemo(() => {
    const loading = !balances;
    const empty = balances
      ? !balances.map((b) => b.greaterThan(0)).includes(true)
      : null;

    return { loading, empty };
  }, [balances]);

  const mints = useMints();
  const burns = useBurns();

  const totalTrades = useMemo(
    () => (mints && burns ? mints.length + burns.length : null),
    [burns, mints]
  );

  return (
    <div tw="max-w-2xl flex flex-col gap-4 w-full">
      <p tw="font-bold text-2xl text-default">
        Track your portfolio performance
      </p>

      <p tw=" text-default">
        See how much your perpetual options are worth in real time or manage
        your positions.
      </p>

      {address ? (
        <div tw="bg-blue bg-opacity-20 border-2 border-blue flex justify-center w-full p-3 rounded-lg">
          <p tw="text-blue">
            {totalTrades ? totalTrades : <LoadingSpinner />} total trades
            performed
          </p>
        </div>
      ) : null}
      {/* 168 */}
      <Module tw="p-0">
        <div tw="px-3 py-2 text-secondary justify-start w-full md:flex hidden font-bold">
          <p tw="w-60">Market</p>
          <p tw="w-36">Value</p>
          <p tw="w-36">Return</p>
        </div>
        <div tw="px-6 py-2 text-secondary justify-between w-full flex md:hidden">
          <p tw="">Market</p>
          <p tw="">Value</p>
        </div>
        <hr tw="border-[#AEAEB2] rounded " />

        {loading ? (
          <LoadingPage />
        ) : !address ? (
          <div tw="flex w-full p-2 justify-center font-bold">
            Connect wallet to see your positions
          </div>
        ) : empty === true ? (
          <div tw="flex w-full p-2 justify-center font-bold">
            You have no positions
          </div>
        ) : (
          markets.map((m) => <PositionCard market={m} key={m.address} />)
        )}
      </Module>
    </div>
  );
};
