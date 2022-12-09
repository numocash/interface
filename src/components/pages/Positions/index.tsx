import React from "react";

import { useEnvironment } from "../../../contexts/environment";
import { PositionCard } from "./positionCard";

export const Positions: React.FC = () => {
  const { markets } = useEnvironment();

  return (
    <div tw="max-w-xl flex flex-col gap-4 w-full">
      {markets.map((m) => (
        <PositionCard market={m} key={m.address} />
      ))}
    </div>
  );
};
