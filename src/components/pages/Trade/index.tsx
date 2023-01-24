import { Filter } from "../TradeDetails/Filter";
import { Explain } from "./Explain";
import { Markets } from "./Markets";
import { Sort } from "./Sort";

export const Trade: React.FC = () => {
  return (
    <div tw="flex flex-col gap-4 w-full max-w-xl">
      <Explain />
      <p tw="text-xs text-default">
        Displaying <span tw="font-semibold">1 markets</span>
      </p>
      <div tw="flex gap-4">
        <Filter />
        <Sort />
      </div>
      <Markets />
    </div>
  );
};
