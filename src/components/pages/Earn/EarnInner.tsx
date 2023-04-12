import { NavLink } from "react-router-dom";

import { LiquidStaking } from "./LiquidStaking";
import { useEnvironment } from "../../../contexts/useEnvironment";
import { Button } from "../../common/Button";
import { PageMargin } from "../../layout";

export const EarnInner: React.FC = () => {
  const environment = useEnvironment();
  return (
    <PageMargin tw="w-full pb-12 sm:pb-0 flex flex-col  gap-2">
      <div tw="w-full max-w-5xl rounded bg-white  border border-[#dfdfdf] pt-12 md:pt-20 px-6 pb-6 shadow mb-12">
        <div tw="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <p tw="font-bold text-2xl sm:text-4xl">Earn on your assets</p>
          <div tw="gap-2 grid">
            <p tw="sm:text-lg text-[#8f8f8f] max-w-md">
              Provide liquidity to an automated market maker and earn interest
              from lending out your position.
            </p>
            <NavLink to="/create" tw="">
              <Button variant="primary" tw="px-2 py-1 text-lg ">
                Create new market
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
      <div tw="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-5xl w-full">
        {environment.interface.liquidStaking && <LiquidStaking />}
      </div>

      {/* <Markets /> */}
    </PageMargin>
  );
};
