import { useMemo } from "react";
import { NavLink } from "react-router-dom";

import { useEarn } from ".";
import { LiquidStaking } from "./LiquidStaking";
import { ProvideLiquidity } from "./ProvideLiquidity";
import { useEnvironment } from "../../../contexts/useEnvironment";
import type { Lendgine } from "../../../lib/types/lendgine";
import { Button } from "../../common/Button";
import { PageMargin } from "../../layout";

export const EarnInner: React.FC = () => {
  const environment = useEnvironment();
  const { lendgines } = useEarn();

  const partitionedLendgines = useMemo(
    () =>
      Object.values(
        lendgines.reduce((acc: Record<string, Lendgine[]>, cur) => {
          const key = `${cur.token0.address}_${cur.token1.address}`;
          const value = acc[key];
          return {
            ...acc,
            [key]: value ? value.concat(cur) : [cur],
          };
        }, {})
      ),
    [lendgines]
  );

  return (
    <PageMargin tw="w-full pb-12 sm:pb-0 flex flex-col  gap-2">
      <div tw="w-full max-w-5xl rounded bg-white  border border-[#dfdfdf] pt-12 md:pt-20 px-6 pb-6 shadow mb-12">
        <div tw="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <p tw="font-bold text-2xl sm:text-4xl">Earn on your assets</p>
          <div tw="gap-2 grid">
            <p tw="sm:text-lg text-[#8f8f8f] max-w-md">
              Numoen has created several strategies using our underlying PMMP.
              All strategies maintain maximum safety and decentralization.
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
        {environment.interface.liquidStaking && (
          <ProvideLiquidity
            lendgines={[environment.interface.liquidStaking.lendgine] as const}
            protocol="stpmmp"
          />
        )}
        {partitionedLendgines.map((pl) => (
          <ProvideLiquidity
            key={pl[0]!.address}
            lendgines={pl}
            protocol="pmmp"
          />
        ))}
      </div>
    </PageMargin>
  );
};
