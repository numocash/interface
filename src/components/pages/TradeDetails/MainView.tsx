import { TokenIcon } from "../../common/TokenIcon";
import { Chart } from "./Chart/Chart";
import { TimeSelector } from "./Chart/TimeSelector";
import { History } from "./History/History";
import { Positions } from "./History/Positions/Positions";
import { useTradeDetails } from "./TradeDetailsInner";

export const MainView: React.FC = () => {
  const { base: denom, quote: other } = useTradeDetails();
  return (
    <div tw="col-span-2 w-full flex mt-2 flex-col pr-6 lg:pr-8 xl:pr-12 gap-2 transform ease-in-out duration-300">
      <div tw="flex w-full">
        <div tw="flex flex-col gap-2">
          <div tw="flex items-center gap-3">
            <div tw="flex items-center space-x-[-0.5rem]">
              <TokenIcon token={other} size={32} />
              <TokenIcon token={denom} size={32} />
            </div>
            <div tw="flex gap-1 font-semibold text-lg text-default ">
              <p tw="border-b-2 border-b-green-500">{other.symbol}</p>
              <p>/</p>
              <p tw="border-b-2 border-b-red">{denom.symbol}</p>
            </div>
          </div>
        </div>
      </div>
      <Chart />
      <TimeSelector />
      <div tw="border-b-2 border-gray-200" />
      <History />
      <Positions />
    </div>
  );
};
