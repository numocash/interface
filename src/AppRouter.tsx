import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Create } from "./components/pages/Create";
import { Earn } from "./components/pages/Earn";
import { Trade } from "./components/pages/Trade";
import { TradeDetails } from "./components/pages/TradeDetails";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />
      <Route
        path="/trade/details/:addressA/:addressB"
        element={<TradeDetails />}
      />
      <Route path="/earn" element={<Earn />} />

      <Route path="/create/" element={<Create />} />

      <Route path="" element={<Navigate to="trade" replace />} />
    </Routes>
  );
};
