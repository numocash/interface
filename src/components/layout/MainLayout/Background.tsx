import { keyframes } from "@emotion/react";
import { styled } from "twin.macro";

import stars from "./BackgroundImages/stars.png";
import twinkling from "./BackgroundImages/twinkling.png";

export const Background: React.FC = () => (
  <>
    <Stars />
    <Twinkling />
  </>
);

const BGLayer = styled.div`
  position: fixed;
  display: block;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
`;

const Stars = styled(BGLayer)`
  z-index: -2;
  background: #000 url(${stars}) repeat top center;
`;

const moveTwinkBack = keyframes`
  from {
    background-position: 0 0;
  }
  to {
    background-position: -10000px 5000px;
  }
`;

const Twinkling = styled(BGLayer)`
  z-index: -1;
  background: transparent url(${twinkling}) repeat top center;
  animation: ${moveTwinkBack} 200s linear infinite;
`;
