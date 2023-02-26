import styled from "@emotion/styled";
import type { ReactNode } from "react";
import React from "react";
import { Toaster } from "react-hot-toast";
import tw from "twin.macro";

import { Background } from "./Background";
import { Header } from "./Header";
import { PageLayout } from "./PageLayout";

interface IProps {
  children: ReactNode | ReactNode[];
}

export const Layout: React.FC<IProps> = ({ children }: IProps) => {
  return (
    <>
      {/* <div tw="font-semibold  text-default p-1 bg-[#FBCC5C]">
        Warning: Beta Version{" "}
        <span tw="font-normal text-secondary">v1.0.0 </span>
        <span tw="text-default font-normal text-sm">
          Core contracts have been{" "}
          <a tw="underline" href="https://www.certik.com/projects/numoen">
            audited
          </a>{" "}
          but should still be used at your own risk. Please use caution.
        </span>
      </div> */}
      <Background />
      <Header />
      <PageWrapper>
        <PageLayout>{children}</PageLayout>
        <Toaster />
      </PageWrapper>
    </>
  );
};

const PageWrapper = styled.div`
  ${tw`relative items-center duration-300 ease-in-out transform`}
`;

export const PageMargin = styled.div(() => [
  tw`relative items-center px-8 mx-auto mt-20 mb-12 lg:px-10`,
]);
