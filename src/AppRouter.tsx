import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Create } from "./components/pages/Create";
import { Earn } from "./components/pages/Earn";
import { LiquidStaking } from "./components/pages/LiquidStaking";
import { Trade } from "./components/pages/Trade";
import { useEnvironment } from "./contexts/useEnvironment";

export const AppRouter: React.FC = () => {
  const environment = useEnvironment();

  const specialty = environment.interface.specialtyMarkets?.[0];
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />
      <Route path="/earn" element={<Earn />} />
      <Route path="/earn/liquid-staking" element={<LiquidStaking />} />

      <Route path="/create/" element={<Create />} />

      <Route
        path=""
        element={
          <Navigate
            to={
              specialty
                ? `/trade/details/${specialty.base.address}/${specialty.quote.address}`
                : "/trade"
            }
            replace
          />
        }
      />
    </Routes>
  );
};
