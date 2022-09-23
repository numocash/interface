import { styled } from "twin.macro";

import purple from "./BackgroundImages/purple.png";

export const Background: React.FC = () => (
  <>
    <Gradient />
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

const Gradient = styled(BGLayer)`
  z-index: -2;
  background-color: #ffffff;
  background-image: url(${purple});
  background-repeat: no-repeat;
  background-size: auto;
`;
