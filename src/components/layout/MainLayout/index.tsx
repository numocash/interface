import styled from "@emotion/styled";
import type { ReactNode } from "react";
import React from "react";
import { Toaster } from "react-hot-toast";
import tw from "twin.macro";

import { Background } from "./Background";
import { Header } from "./Header";
import { PageLayout } from "./PageLayout";

interface IProps {
  sideNav?: React.ReactNode;
  hideOptions?: boolean;
  children: ReactNode | ReactNode[];
}

export const MainLayout: React.FC<IProps> = ({ children }: IProps) => {
  return (
    <>
      <div tw=" w-full  border-b-2 border-red-500">
        <div tw="font-semibold text-lg text-default p-2">
          Warning: Alpha Version{" "}
          <span tw="font-normal text-secondary">v0.2.0 </span>
          <span tw="text-default font-normal text-sm">
            This program is to be considered experimental. Contracts used have
            been submitted to{" "}
            <a tw="underline" href="https://www.certik.com/projects/numoen">
              audit
            </a>
            .
          </span>
        </div>
      </div>
      <PageWrapper>
        <Background />
        <Header />
        <PageLayout>{children}</PageLayout>
        <Toaster />
      </PageWrapper>
    </>
  );
};

const PageWrapper = styled.div`
  ${tw`relative w-11/12 mx-auto mb-32 md:mb-12`}
`;
