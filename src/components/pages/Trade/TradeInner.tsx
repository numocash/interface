import { Display } from "../../common/Display";
import { Filter } from "../../common/Filter";
import { PageMargin } from "../../layout";
import { useTrade } from ".";
import { Explain } from "./Explain/Explain";
import { Markets } from "./Markets";

export const TradeInner: React.FC = () => {
  const { markets, assets, setAssets } = useTrade();
  return (
    <>
      <Explain />
      <div tw="border-b-2 border-stroke h-72 relative mt-[-288px] bg-secondary -z-10 w-full" />

      <PageMargin tw="mt-8 w-full max-w-4xl">
        <div tw="flex flex-col gap-4 w-full justify-center">
          <Display numMarkets={markets?.length} />
          <div tw="flex gap-4">
            <Filter assets={assets} setAssets={setAssets} />
            {/* <Sort /> */}
          </div>
          <Markets />
        </div>
      </PageMargin>
    </>
  );
};
