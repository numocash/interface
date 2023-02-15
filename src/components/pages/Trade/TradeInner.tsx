import { Display } from "../../common/Display";
import { Filter } from "../../common/Filter";
import { useTrade } from ".";
import { Explain } from "./Explain";
import { Markets } from "./Markets";

export const TradeInner: React.FC = () => {
  const { markets, assets, setAssets } = useTrade();
  return (
    <div tw="flex flex-col gap-4 w-full max-w-3xl">
      <Explain />
      <Display numMarkets={markets.length} />
      <div tw="flex gap-4">
        <Filter assets={assets} setAssets={setAssets} />
        {/* <Sort /> */}
      </div>
      <Markets />
    </div>
  );
};
