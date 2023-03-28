import { useState } from "react";
import { objectKeys } from "ts-extras";
import tw, { css } from "twin.macro";

const Tabs = {
  details: "Details",
  strategy: "Strategy",
} as const;

export const About: React.FC = () => {
  const [tab, setTab] = useState<keyof typeof Tabs>("details");
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
            <p tw="text-sm text-secondary">Staking APR</p>
            <p tw=" ">5.00%</p>
          </div>
          <div tw="flex justify-between  items-center ">
            <p tw="text-sm text-secondary">Max boost w/o funding</p>
            <p tw=" ">10.25%</p>
          </div>
          <div tw="flex justify-between  items-center ">
            <p tw="text-sm text-secondary">Funding APR</p>
            <p tw=" ">3.00%</p>
          </div>
          <div tw="flex justify-between  items-center ">
            <p tw="text-sm text-secondary">Total boosted APR</p>
            <p tw=" ">7.25%</p>
          </div>
          <div tw="flex justify-between  items-center ">
            <p tw="text-sm text-secondary">Net APY</p>
            <p tw=" ">7.25%</p>
          </div>
        </div>
      )}
      {tab === "strategy" && (
        <div tw="flex flex-col gap-2">
          <p tw="text-secondary">
            This represents a tokenized leveraged long stMATIC position. Holders
            earn because of the inherently increasing nature of staking.
          </p>
        </div>
      )}
    </>
  );
};
