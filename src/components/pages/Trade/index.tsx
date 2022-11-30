import { Arbitrum } from "./Arbitrum";
import { Swap } from "./Swap";
import { SwapStateProvider } from "./useSwapState";

export const Trade: React.FC = () => {
  return (
    <div tw="flex flex-col gap-4">
      <Arbitrum />
      <SwapStateProvider>
        <Swap />
      </SwapStateProvider>
    </div>
  );
};
