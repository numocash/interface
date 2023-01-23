import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Arb } from "./components/pages/Arb";
import { Swap } from "./components/pages/Arb/Swap";
import { Earn } from "./components/pages/Earn";
import { Manage } from "./components/pages/Earn/Manage";
import { Portfolio } from "./components/pages/Positions";
import { Trade } from "./components/pages/Trade";
import { TradeDetails } from "./components/pages/TradeDetails";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />
      <Route path="/detail" element={<TradeDetails />} />

      <Route path="/earn" element={<Earn />} />
      <Route path="/earn/:lendgineAddress" element={<Manage />} />
      <Route path="/earn/:lendgineAddress/:tokenID" element={<Manage />} />
      <Route path="/arb" element={<Arb />} />
      <Route path="/arb/:lendgineAddress" element={<Swap />} />
      <Route path="/portfolio" element={<Portfolio />} />

      <Route path="" element={<Navigate to="trade" replace />} />
    </Routes>
  );
};
