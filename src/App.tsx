import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "./AppRouter";
import { Layout } from "./components/layout/";
import { Background } from "./components/layout//Background";
import { globalStyles } from "./globalStyles";
import {
  useExistingLendginesQueryFn,
  useExistingLendginesQueryKey,
} from "./hooks/useLendgine";

export const App: React.FC = () => {
  const queryClient = useQueryClient();
  // const tokenQueryKey = useDefaultTokenListQueryKey();
  // const tokenQueryFn = useDefaultTokenListQueryFn();
  const lendgineQueryKey = useExistingLendginesQueryKey();
  const lendgineQueryFn = useExistingLendginesQueryFn();

  // prefetch token lists and lendgines
  useEffect(() => {
    // async function p1() {
    //   await queryClient.prefetchQuery({
    //     queryKey: tokenQueryKey,
    //     queryFn: tokenQueryFn,
    //     staleTime: Infinity,
    //   });
    // }

    async function p2() {
      await queryClient.prefetchQuery({
        queryKey: lendgineQueryKey,
        queryFn: lendgineQueryFn,
        staleTime: Infinity,
      });
    }
    void p2();
  }, [lendgineQueryFn, lendgineQueryKey, queryClient]);

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
