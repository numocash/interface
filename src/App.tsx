import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "./AppRouter";
import { MainLayout } from "./components/layout/MainLayout";
import { Background } from "./components/layout/MainLayout/Background";
import { globalStyles } from "./globalStyles";

export const App: React.FC = () => {
  return (
    <div className="App">
      <Background />
      {globalStyles}
      <BrowserRouter>
        <MainLayout>
          <AppRouter />
        </MainLayout>
      </BrowserRouter>
    </div>
  );
};
