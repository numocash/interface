import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Create } from "./components/pages/Create";
import { Earn } from "./components/pages/Earn";
import { EarnDetails } from "./components/pages/EarnDetails";
import { LiquidStaking } from "./components/pages/LiquidStaking";
import { Trade } from "./components/pages/Trade";
import { TradeDetails } from "./components/pages/TradeDetails";
import { useEnvironment } from "./contexts/useEnvironment";

export const AppRouter: React.FC = () => {
  const environment = useEnvironment();

  const specialty = environment.interface.specialtyMarkets?.[0];
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />
      <Route path="/trade/details/:base/:quote" element={<TradeDetails />} />
      <Route path="/earn" element={<Earn />} />
      <Route path="/earn/details/:base/:quote" element={<EarnDetails />} />
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
