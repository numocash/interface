import { Chart } from "./Chart";
import { TradeColumn } from "./TradeColumn";

export const TradeDetails: React.FC = () => {
  return (
    <div tw="w-full grid grid-cols-3">
      <Chart tw="" />
      <div tw="flex max-w-sm ">
        {/* TODO: stick to the right side */}
        <div tw="border-l-2 border-gray-200 sticky h-[75vh] min-h-[50rem] mt-[-1rem]" />
        <TradeColumn tw="" />
      </div>
    </div>
  );
};
