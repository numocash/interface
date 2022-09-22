import React from "react";
import { Route, Routes } from "react-router-dom";

import { Pool } from "./components/pages/Pool";
import { AddPosition } from "./components/pages/Pool/AddPosition";
import { CreatePosition } from "./components/pages/Pool/CreatePosition";
import { RemovePosition } from "./components/pages/Pool/RemovePosition";
import { Trade } from "./components/pages/Trade";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />

      <Route path="/pool" element={<Pool />} />
      <Route path="/pool/create-position" element={<CreatePosition />} />
      <Route
        path="/pool/add-position/:marketAddress"
        element={<AddPosition />}
      />
      <Route
        path="/pool/remove-position/:marketAddress"
        element={<RemovePosition />}
      />
    </Routes>
  );
};
