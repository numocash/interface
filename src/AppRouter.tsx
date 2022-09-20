import React from "react";
import { Route, Routes } from "react-router-dom";

import { Trade } from "./components/pages/Pool";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />
    </Routes>
  );
};
