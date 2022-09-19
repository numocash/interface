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
    <PageWrapper>
      <Background />
      <Header />
      <PageLayout>{children}</PageLayout>
      <Toaster />
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  ${tw`relative w-11/12 mx-auto mb-32 md:mb-12`}
`;
