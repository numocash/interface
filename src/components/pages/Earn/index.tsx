import { useMemo } from "react";
import { useAccount } from "wagmi";

import type { IMarket, IMarketUserInfo } from "../../../contexts/environment";
import { useEnvironment } from "../../../contexts/environment";
import { useUserLendgines } from "../../../hooks/useLendgine";
import { LoadingPage } from "../../common/LoadingPage";
import { Learn } from "./Learn";
import { PositionCard } from "./PositionCard";

export const Earn: React.FC = () => {
  const { markets } = useEnvironment();
  const { address } = useAccount();

  const userMarketInfo = useUserLendgines(address, markets);

  type display = {
    market: IMarket;
    userInfo: IMarketUserInfo | null;
  };

  const { displayMarkets, hasDeposit } = useMemo(() => {
    const userMarkets: display[] =
      userMarketInfo?.map((m) => ({
        market: m.market,
        userInfo: m,
      })) ?? [];

    const hold = userMarkets.map((m) => m.market);

    const nonUserMarkets: display[] = markets
      .filter((m) => !hold.includes(m))
      .map((m) => ({ market: m, userInfo: null }));
    return {
      displayMarkets: userMarkets.concat(nonUserMarkets),
      hasDeposit: userMarkets.length > 0,
    };
  }, [markets, userMarketInfo]);

  return (
    <div tw="grid w-full max-w-3xl flex-col gap-4">
      <p tw="font-bold text-2xl text-default">Earn on your assets</p>

      <p tw=" text-default">
        Provide liquidity to Numoen pools and lend your position to options
        buyers to earn yield.
      </p>
      <p tw="text-xs text-default">
        Displaying <span tw="font-semibold">{markets.length} markets</span>
      </p>
      <Learn />
      {hasDeposit && (
        <p tw="text-xs text-amber-300 font-semibold mb-[-0.5rem]">
          Your positions
        </p>
      )}
      {/* TODO: show all when wallet disconnected */}
      {userMarketInfo === null ? (
        <LoadingPage />
      ) : (
        <div tw="grid md:grid-cols-2  gap-6">
          {displayMarkets.map((d) => (
            <PositionCard
              key={d.market.address}
              userInfo={d.userInfo}
              market={d.market}
            />
          ))}
        </div>
      )}
    </div>
  );
};
