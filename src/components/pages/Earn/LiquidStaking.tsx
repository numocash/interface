import { BsLightningChargeFill } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { styled } from "twin.macro";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { Button } from "../../common/Button";

export const LiquidStaking: React.FC = () => {
  const environment = useEnvironment();

  return (
    <Background
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color={environment.interface.liquidStaking!.color}
      tw="w-full max-w-5xl rounded flex justify-between p-6 shadow items-center mb-12"
    >
      <div tw="grid gap-4">
        <p tw="text-3xl font-bold">Liquid Staking Boost</p>
        <p tw="text-secondary items-center flex gap-1">
          Boost your{" "}
          {environment.interface.liquidStaking?.lendgine.token1.symbol} yield
          from 5.3% to
          <Shake tw="flex gap-1 items-center">
            <p tw="text-xl font-bold">8.7%</p>
            <BsLightningChargeFill tw="fill-yellow-300 text-xl" />
          </Shake>
        </p>
      </div>
      <NavLink to="liquid-staking">
        <Button variant="inverse" tw=" text-xl px-6 py-2 h-fit">
          Stake now
        </Button>
      </NavLink>
    </Background>
  );
};

const Background = styled.div<{ color: `#${string}` }>`
  background-image: linear-gradient(
    to top right,
    white,
    ${({ color }) => color}
  );
`;

const Shake = styled.div`
  animation: shake 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;

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
