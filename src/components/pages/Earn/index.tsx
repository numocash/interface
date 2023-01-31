import type { IMarket, IMarketUserInfo } from "@dahlia-labs/numoen-utils";
import { NavLink } from "react-router-dom";
import { useAccount } from "wagmi";

import { Button } from "../../common/Button";
import { LoadingPage } from "../../common/LoadingPage";
import { Sort } from "../Trade/Sort";
import { Explain } from "./Explain";

export const Earn: React.FC = () => {
  // const { markets } = useEnvironment();
  const { address } = useAccount();

  // const userMarketInfo = useUserLendgines(address, markets);

  type display = {
    market: IMarket;
    userInfo: IMarketUserInfo | null;
  };

  // const createdLendgines = useCreatedLendgines();

  // const { displayMarkets, hasDeposit } = useMemo(() => {
  //   const userMarkets: display[] =
  //     userMarketInfo?.map((m) => ({
  //       market: m.market,
  //       userInfo: m,
  //     })) ?? [];

  //   const hold = userMarkets.map((m) => m.market);

  //   const nonUserMarkets: display[] = markets
  //     .filter((m) => !hold.includes(m))
  //     .map((m) => ({ market: m, userInfo: null }));
  //   return {
  //     displayMarkets: userMarkets.concat(nonUserMarkets),
  //     hasDeposit: userMarkets.length > 0,
  //   };
  // }, [markets, userMarketInfo]);

  return (
    <div tw="grid w-full max-w-3xl flex-col gap-4">
      <Explain />
      <p tw="text-xs text-default">
        Displaying <span tw="font-semibold">{2} markets</span>
      </p>
      <div tw="flex w-full justify-between gap-4">
        {/* <Filter /> */}
        <Sort />
        <NavLink to="/create/">
          <Button tw="h-12 text-lg" variant="primary">
            Create new market
          </Button>
        </NavLink>
      </div>

      {/* <Learn />
      {hasDeposit && (
        <p tw="text-xs text-black font-semibold mb-[-0.5rem]">Your positions</p>
      )}
      {userMarketInfo === null && address !== undefined ? ( */}
      <LoadingPage />
      {/* ) : (
        <div tw="grid md:grid-cols-2 gap-6">
          {displayMarkets.map((d) => (
            <PositionCard
              key={d.market.address}
              userInfo={d.userInfo}
              market={d.market}
            />
          ))}
        </div>
      )} */}
    </div>
  );
};
