import React from "react";
import { Route, Routes } from "react-router-dom";

import { View } from "./components/pages";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<View />} />
    </Routes>
  );
};
