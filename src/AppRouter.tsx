import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Create } from "./components/pages/Create";
import { Earn } from "./components/pages/Earn";
import { LiquidStaking } from "./components/pages/LiquidStaking";
import { ProvideLiquidity } from "./components/pages/ProvideLiquidity";
// import { Trade } from "./components/pages/Trade";
import { useEnvironment } from "./contexts/useEnvironment";

export const AppRouter: React.FC = () => {
  const environment = useEnvironment();

  const specialty = environment.interface.specialtyMarkets?.[0];
  return (
    <Routes>
      {/* <Route path="/trade" element={<Trade />} /> */}
      <Route path="/earn" element={<Earn />} />
      <Route path="/earn/liquid-staking" element={<LiquidStaking />} />
      <Route
        path="/earn/provide-liquidity/:protocol/:token0/:token1"
        element={<ProvideLiquidity />}
      />

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
