import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "./AppRouter";
import { Layout } from "./components/layout/";
import { Background } from "./components/layout//Background";
import { globalStyles } from "./globalStyles";

export const App: React.FC = () => {
  return (
    <div className="App">
      <Background />
      {globalStyles}
      <BrowserRouter>
        <Layout>
          <AppRouter />
        </Layout>
      </BrowserRouter>
    </div>
  );
};
