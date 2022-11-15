import { Swap } from "./Swap";
import { SwapStateProvider } from "./useSwapState";

export const Trade: React.FC = () => {
  return (
    <div tw="flex flex-col gap-4">
      <SwapStateProvider>
        <Swap />
      </SwapStateProvider>
    </div>
  );
};
