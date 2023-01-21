import tw, { styled } from "twin.macro";

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
  ${tw`bg-white`}
`;
