/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BsLightningChargeFill } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { styled } from "twin.macro";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { formatPercent } from "../../../utils/format";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { TokenIcon } from "../../common/TokenIcon";
import { useLongReturns } from "../LiquidStaking/useReturns";

export const LiquidStaking: React.FC = () => {
  const environment = useEnvironment();
  const longAPRQuery = useLongReturns();

  return (
    <NavLink
      to="liquid-staking"
      tw="transform ease-in-out sm:hover:scale-105 w-full"
    >
      <Background
        color={environment.interface.liquidStaking!.color}
        tw="w-full transform ease-in-out sm:hover:scale-105 rounded-xl flex flex-col gap-4 p-6 shadow items-center"
      >
        <p tw="text-2xl font-bold">Liquid Staking Boost</p>
        <TokenIcon
          token={environment.interface.liquidStaking!.lendgine.token1}
          size={48}
        />
        <Shake tw="flex gap-1 items-center">
          <p tw="text-xl font-bold text-secondary">
            {longAPRQuery.status === "success" ? (
              formatPercent(longAPRQuery.data.totalAPR)
            ) : (
              <LoadingSpinner />
            )}
          </p>
          <BsLightningChargeFill tw="fill-yellow-300 text-xl" />
        </Shake>
        <p tw="text-secondary items-center ">
          Boost your{" "}
          {environment.interface.liquidStaking?.lendgine.token1.symbol} yield by
          speculating on staking rewards
        </p>
      </Background>
    </NavLink>
  );
};

const Background = styled.div<{ color: `#${string}` }>`
  background-image: linear-gradient(
    to top right,
    white,
    85%,
    ${({ color }) => color}
  );
`;

const Shake = styled.span`
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
