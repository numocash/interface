import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Create } from "./components/pages/Create";
import { Earn } from "./components/pages/Earn";
import { EarnDetails } from "./components/pages/EarnDetails";
import { Trade } from "./components/pages/Trade";
import { TradeDetails } from "./components/pages/TradeDetails";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />
      <Route path="/trade/details/:base/:quote" element={<TradeDetails />} />
      <Route path="/earn" element={<Earn />} />
      <Route path="/earn/details/:base/:quote" element={<EarnDetails />} />

      <Route path="/create/" element={<Create />} />

      <Route path="" element={<Navigate to="trade" replace />} />
    </Routes>
  );
};
