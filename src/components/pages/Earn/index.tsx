import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../contexts/environment";
import { useUserLendgine } from "../../../hooks/useLendgine";
import { LoadingPage } from "../../common/LoadingPage";
import { Learn } from "./Learn";
import { PositionCard } from "./PositionCard";

export const Earn: React.FC = () => {
  const { markets } = useEnvironment();
  const { address } = useAccount();

  const market = markets[0];
  invariant(market);
  const userMarketInfo = useUserLendgine(address, market);

  return (
    <div tw="grid w-full max-w-3xl flex-col gap-4">
      <p tw="font-bold text-2xl text-default">Earn on your assets</p>
      <p tw=" text-default">
        Provide liquidity to Numoen pools and lend your position to options
        buyers to earn yield.
      </p>
      <p tw="text-sm text-default">
        Displaying <span tw="font-semibold">{markets.length} markets</span>
      </p>
      <Learn />
      {/* TODO: show all when wallet disconnected */}
      {userMarketInfo === null ? (
        <LoadingPage />
      ) : (
        <div tw="grid md:grid-cols-2  gap-6">
          {userMarketInfo.map((m) => (
            <PositionCard key={m.tokenID} userInfo={m} market={market} />
          ))}
        </div>
      )}
    </div>
  );
};
