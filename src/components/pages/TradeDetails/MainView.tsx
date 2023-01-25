import { NavLink } from "react-router-dom";

import { ReactComponent as ReverseIcon } from "../../../icons/repeat.svg";
import { TokenIcon } from "../../common/TokenIcon";
import { useTradeDetails } from ".";
import { Chart } from "./Chart";
import { EmptyPosition } from "./EmptyPosition";
import { History } from "./History";
import { TimeSelector } from "./TimeSelector";

export const MainView: React.FC = () => {
  const { denom, other } = useTradeDetails();
  return (
    <div tw="col-span-2 w-full flex mt-2 flex-col pr-6 lg:pr-8 xl:pr-12 gap-2 transform ease-in-out duration-300">
      <div tw="flex w-full">
        <div tw="flex flex-col gap-2">
          <div tw="flex items-center gap-3">
            <div tw="flex items-center space-x-[-0.5rem]">
              <TokenIcon token={other} size={32} />
              <TokenIcon token={denom} size={32} />
            </div>
            <div tw="grid gap-0.5">
              <span tw="font-semibold text-lg text-default leading-tight">
                {other.symbol} / {denom.symbol}
              </span>
            </div>
            <NavLink
              to={"/trade/details/" + other.address + "/" + denom.address}
            >
              <ReverseIcon tw="rounded-lg bg-gray-200 p-1" />
            </NavLink>
          </div>
        </div>
      </div>
      <Chart />
      <TimeSelector />
      <div tw="border-b-2 border-gray-200" />
      <History />
      <EmptyPosition />
    </div>
  );
};
