import styled from "@emotion/styled";
import type { ReactNode } from "react";
import React from "react";
import { Toaster } from "react-hot-toast";
import tw from "twin.macro";

import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { PageLayout } from "./PageLayout";

interface IProps {
  children: ReactNode | ReactNode[];
}

export const Layout: React.FC<IProps> = ({ children }: IProps) => {
  return (
    <>
      <Background />
      <Header />
      <PageWrapper>
        <PageLayout>{children}</PageLayout>
      </PageWrapper>
      <Toaster />
      <Footer />
    </>
  );
};

const PageWrapper = styled.div`
  ${tw`relative items-center duration-300 ease-in-out transform`}
`;

export const PageMargin = styled.div(() => [
  tw`relative items-center px-4 mx-auto mt-10 md:px-6 lg:px-10`,
]);
