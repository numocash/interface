/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { styled } from "twin.macro";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { formatPercent } from "../../../utils/format";
import { Button } from "../../common/Button";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { useLPReturns, useLongReturns } from "../LiquidStaking/useReturns";

export const LiquidStaking: React.FC = () => {
  const environment = useEnvironment();
  const longAPR = useLongReturns();
  const lpAPR = useLPReturns();

  const maxAPR = useMemo(
    () =>
      !longAPR.totalAPR || !lpAPR.totalAPR
        ? undefined
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        longAPR.totalAPR?.greaterThan(lpAPR.totalAPR)
        ? longAPR.totalAPR
        : lpAPR.totalAPR,
    [longAPR, lpAPR]
  );

  return (
    <Background
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color={environment.interface.liquidStaking!.color}
      tw="w-full max-w-5xl rounded grid gap-4 sm:(justify-between flex) p-6 shadow items-center mb-12"
    >
      <div tw="grid gap-4">
        <p tw="text-3xl font-bold">Liquid Staking Boost</p>
        <p tw="text-secondary items-center ">
          Boost your{" "}
          {environment.interface.liquidStaking?.lendgine.token1.symbol} yield
          from {formatPercent(environment.interface.liquidStaking!.return)} to
          <Shake tw="flex gap-1 items-center">
            <p tw="text-xl font-bold">
              {maxAPR ? formatPercent(maxAPR) : <LoadingSpinner />}
            </p>
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
