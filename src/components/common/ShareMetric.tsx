import styled from "@emotion/styled";
import React from "react";
import tw from "twin.macro";

type IProps = {
  title: string;
  value: React.ReactNode;
  faded?: boolean;
};

export const ShareMetric: React.FC<IProps> = ({
  title,
  value,
  faded,
}: IProps) => {
  return (
    <Wrapper faded={faded}>
      <h3 tw="mb-3 text-secondary">{title}</h3>
      <span>{value}</span>
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  faded?: boolean;
}>`
  ${tw`flex flex-col text-base font-medium`}
  line-height: 19px;
  & > span {
    color: ${({ theme, faded }) =>
      faded === true ? theme.colors.text.muted : theme.colors.text.bold};
  }
`;
