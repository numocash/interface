import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Earn } from "./components/pages/Earn";
import { AddPosition } from "./components/pages/Earn/AddPosition";
import { CreatePosition } from "./components/pages/Earn/CreatePosition";
import { RemovePosition } from "./components/pages/Earn/RemovePosition";
import { Trade } from "./components/pages/Trade";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/trade" element={<Trade />} />

      <Route path="/earn" element={<Earn />} />
      <Route path="/earn/create-position" element={<CreatePosition />} />
      <Route
        path="/earn/add-position/:marketAddress"
        element={<AddPosition />}
      />
      <Route
        path="/earn/remove-position/:marketAddress"
        element={<RemovePosition />}
      />

      <Route path="" element={<Navigate to="trade" replace />} />
    </Routes>
  );
};
