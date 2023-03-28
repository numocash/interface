import { BsLightningChargeFill } from "react-icons/bs";
import { styled } from "twin.macro";

import { Button } from "../../common/Button";

export const LiquidStaking: React.FC = () => {
  // const environment = useEnvironment();

  return (
    <div tw="w-full max-w-5xl rounded bg-white  flex justify-between p-6 shadow bg-gradient-to-tr from-white to-[#a457ff] items-center">
      <div tw="grid gap-4">
        <p tw="text-3xl font-bold">Liquid Staking Boost</p>
        <p tw="text-secondary items-center flex gap-1">
          Boost your stMatic from 5.3% to
          <span tw="text-xl font-bold">8.7%</span>
          {/* <Wrapper tw="ease-in-out z-10 transform duration-1000"> */}
          <Shake tw="fill-yellow-300 text-xl" />
          {/* </Wrapper> */}
        </p>
      </div>
      <Button variant="inverse" tw=" text-xl px-6 py-2 h-fit">
        Stake now
      </Button>
    </div>
  );
};

const Shake = styled(BsLightningChargeFill)`
  animation: shake 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;

  text-shadow: 1px 1px 2px black, 0 0 25px blue, 0 0 5px darkblue;

  @keyframes shake {
    0% {
      transform: translate(0.5px, 0.5px) rotate(0deg);
    }
    10% {
      transform: translate(-0.5px, -1px) rotate(-1deg);
    }
    20% {
      transform: translate(-1.5px, 0px) rotate(1deg);
    }
    30% {
      transform: translate(1.5px, 1px) rotate(0deg);
    }
    40% {
      transform: translate(0.5px, -0.5px) rotate(1deg);
    }
    50% {
      transform: translate(-0.5px, 1px) rotate(-1deg);
    }
    60% {
      transform: translate(-1.5px, 0.5px) rotate(0deg);
    }
    70% {
      transform: translate(1.5px, 0.5px) rotate(-1deg);
    }
    80% {
      transform: translate(-0.5px, -0.5px) rotate(1deg);
    }
    90% {
      transform: translate(0.5px, 1px) rotate(0deg);
    }
    100% {
      transform: translate(0.5px, -1px) rotate(-1deg);
    }
  }
`;
