import { useState } from "react";
import { objectKeys } from "ts-extras";
import tw, { css } from "twin.macro";

import { formatPercent } from "../../../../utils/format";
import { LoadingSpinner } from "../../../common/LoadingSpinner";
import { useLPReturns } from "../useReturns";

const Tabs = {
  details: "Details",
  strategy: "Strategy",
} as const;

export const About: React.FC = () => {
  const [tab, setTab] = useState<keyof typeof Tabs>("details");

  const returns = useLPReturns();
  return (
    <>
      <div tw=" w-fit flex  justify-start p-0.5 items-center rounded-xl bg-gray-100">
        {objectKeys(Tabs).map((t) => {
          return (
            <div key={Tabs[t]}>
              <button
                css={css`
                  ${tw`grid px-2 py-1 font-semibold text-gray-500 border border-transparent rounded-xl justify-items-center`}
                  ${tw`hover:(text-gray-700) transform duration-300 ease-in-out`}
          ${t === tab &&
                  tw`text-black bg-white rounded-[10px] border-gray-300/50`}
                `}
                onClick={() => {
                  setTab(t);
                }}
              >
                <span>{Tabs[t]}</span>
              </button>
            </div>
          );
        })}
      </div>
      {tab === "details" && (
        <div tw="flex flex-col gap-2">
          <div tw="flex justify-between  items-center ">
            <p tw="text-sm text-secondary">Expected returns</p>
            <p tw=" ">
              {returns.expectedReturns ? (
                formatPercent(returns.expectedReturns)
              ) : (
                <LoadingSpinner />
              )}
            </p>
          </div>
          <div tw="flex justify-between  items-center ">
            <p tw="text-sm text-secondary">Lending returns</p>
            <p tw=" ">
              {returns.lendingReturns ? (
                formatPercent(returns.lendingReturns)
              ) : (
                <LoadingSpinner />
              )}
            </p>
          </div>

          <div tw="flex justify-between  items-center ">
            <p tw="text-sm text-secondary">Net APR</p>
            <p tw=" ">
              {returns.totalAPR ? (
                formatPercent(returns.totalAPR)
              ) : (
                <LoadingSpinner />
              )}
            </p>
          </div>
        </div>
      )}
      {tab === "strategy" && (
        <div tw="flex flex-col gap-2">
          <p tw="text-secondary">
            This strategy provides liquidity to an automated market maker and
            profits by lending the position out to longs. Because it holds a
            basket of assets, it is less exposed to depeg risks.
          </p>
        </div>
      )}
    </>
  );
};
