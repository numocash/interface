import { EmptyChart } from "./EmptyChart";
import { EmptyPosition } from "./EmptyPosition";
import { History } from "./History";
import { TimeSelector } from "./TimeSelector";

export const Chart: React.FC = () => {
  return (
    <div tw="col-span-2 w-full flex mt-2 flex-col pr-12">
      <div tw="flex w-full">
        <div>
          <p tw="text-xl font-bold">ETH / USDC</p>
          <div tw="flex gap-2 items-center">
            <div tw="bg-gray-200 animate-pulse h-6 w-12 rounded" />
            <div tw="bg-gray-200 animate-pulse h-4 w-10 rounded" />
          </div>
        </div>
      </div>
      <EmptyChart />
      <TimeSelector />
      <div tw="border-b-2 border-gray-200" />
      <History />
      <EmptyPosition />
    </div>
  );
};
