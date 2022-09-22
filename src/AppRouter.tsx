import React from "react";
import { Route, Routes } from "react-router-dom";

import { Pool } from "./components/pages/Pool";
import { CreatePosition } from "./components/pages/Pool/CreatePosition";
import { Trade } from "./components/pages/Trade";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />

      <Route path="/pool" element={<Pool />} />
      <Route path="/pool/create-position" element={<CreatePosition />} />
    </Routes>
  );
};
