import styled from "@emotion/styled";
import type { ReactNode } from "react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import tw from "twin.macro";

interface IProps {
  children: ReactNode | ReactNode[];
}

export const PageLayout: React.FC<IProps> = ({ children }: IProps) => {
  return (
    <PageContainer>
      <ErrorBoundary
        fallback={
          <ErrorMessage>
            An error occurred while loading this page.
          </ErrorMessage>
        }
      >
        {children}
      </ErrorBoundary>
    </PageContainer>
  );
};

const ErrorMessage = styled.p`
  ${tw`text-red`}
`;

const PageContainer = styled.div`
  ${tw`flex flex-col items-center mt-20 md:mt-12`}
`;
