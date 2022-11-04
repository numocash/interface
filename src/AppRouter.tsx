import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Earn } from "./components/pages/Earn";
import { Manage } from "./components/pages/Earn/Manage";
import { Trade } from "./components/pages/Trade";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />

      <Route path="/earn" element={<Earn />} />
      <Route path="/earn/:lendgineAddress" element={<Manage />} />
      <Route path="/earn/:lendgineAddress/:tokenID" element={<Manage />} />

      <Route path="" element={<Navigate to="trade" replace />} />
    </Routes>
  );
};
