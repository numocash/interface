import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Earn } from "./components/pages/Earn";
import { CreatePosition } from "./components/pages/Earn/CreatePosition";
import { Trade } from "./components/pages/Trade";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />

      <Route path="/earn" element={<Earn />} />
      <Route path="/earn/create-position" element={<CreatePosition />} />

      <Route path="" element={<Navigate to="trade" replace />} />
    </Routes>
  );
};
