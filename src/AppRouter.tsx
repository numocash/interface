import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Create } from "./components/layout/pages/Create";
import { Earn } from "./components/layout/pages/Earn";
import { EarnDetails } from "./components/layout/pages/EarnDetails";
import { Test } from "./components/layout/pages/Test";
import { Trade } from "./components/layout/pages/Trade";
import { TradeDetails } from "./components/layout/pages/TradeDetails";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />
      <Route
        path="/trade/details/:addressA/:addressB"
        element={<TradeDetails />}
      />
      <Route path="/earn" element={<Earn />} />
      <Route
        path="/earn/details/:addressA/:addressB"
        element={<EarnDetails />}
      />

      <Route path="/create/" element={<Create />} />
      <Route path="/test" element={<Test />} />

      <Route path="" element={<Navigate to="trade" replace />} />
    </Routes>
  );
};
