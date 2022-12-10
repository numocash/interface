import React from "react";

import { useEnvironment } from "../../../contexts/environment";
import { Module } from "../../common/Module";
import { PositionCard } from "./positionCard";

export const Positions: React.FC = () => {
  const { markets } = useEnvironment();

  return (
    <div tw="max-w-2xl flex flex-col gap-4 w-full">
      <p tw="font-bold text-2xl text-default">Your options on Numoen</p>
      {/* 168 */}
      <Module tw="p-0">
        <div tw="px-3 py-2 text-secondary justify-start w-full md:flex hidden">
          <p tw="w-60">Market</p>
          <p tw="w-36">Value</p>
          <p tw="w-36">Return</p>
        </div>
        <div tw="px-3 py-2 text-secondary justify-between w-full flex md:hidden">
          <p tw="">Market</p>
          <p tw="">Value</p>
        </div>
        <hr tw="border-[#AEAEB2] rounded " />

        {markets.map((m) => (
          <PositionCard market={m} key={m.address} />
        ))}
      </Module>
    </div>
  );
};
