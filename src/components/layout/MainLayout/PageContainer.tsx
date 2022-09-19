import styled from "@emotion/styled";

export const InnerContainer = styled.div<{ noPad?: boolean }>`
  background: #131419;
  border-radius: 16px;
  padding: ${(props) => !props.noPad && "24px"};
`;
