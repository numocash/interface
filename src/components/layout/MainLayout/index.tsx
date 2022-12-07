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
      <div tw="font-semibold  text-default p-1 bg-red">
        Warning: Beta Version{" "}
        <span tw="font-normal text-secondary">v1.0.0 </span>
        <span tw="text-default font-normal text-sm">
          Please use caution. Core contracts have been{" "}
          <a tw="underline" href="https://www.certik.com/projects/numoen">
            audited
          </a>{" "}
          but should still be used at your own risk.
        </span>
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
