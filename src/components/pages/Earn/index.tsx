import { NavLink } from "react-router-dom";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../contexts/environment";
import { useLendgine } from "../../../hooks/useLendgine";
import { Button } from "../../common/Button";
import { LoadingPage } from "../../common/LoadingPage";
import { EmptyPosition } from "./EmptyPosition";
import { PositionCard } from "./PositionCard";

export const Earn: React.FC = () => {
  const { markets } = useEnvironment();
  const { address } = useAccount();

  const market = markets[0];
  invariant(market);
  const userMarketInfo = useLendgine(address, market);

  return (
    <div tw="w-full max-w-3xl flex flex-col gap-2">
      <div tw="flex justify-between w-full">
        <p tw=" font-semibold text-2xl text-default">Your Positions</p>
        <NavLink to="/earn/create-position">
          <Button variant="primary">New Position</Button>
        </NavLink>
      </div>
      {!userMarketInfo ? (
        <LoadingPage />
      ) : userMarketInfo.liquidity.equalTo(0) ? (
        <EmptyPosition />
      ) : (
        <PositionCard market={market} />
      )}
    </div>
  );
};
