import { Filter } from "../TradeDetails/Filter";
import { Explain } from "./Explain";
import { Sort } from "./Sort";

export const Trade: React.FC = () => {
  return (
    <div tw="flex flex-col gap-4 w-full">
      <Explain />
      <p tw="text-xs text-default">
        Displaying <span tw="font-semibold">3 markets</span>
      </p>
      <div tw="flex gap-4">
        <Filter />
        <Sort />
      </div>

      {/* <SwapStateProvider>
        <Swap />
      </SwapStateProvider> */}
    </div>
  );
};
