import { Display } from "../../../common/Display";
import { Filter } from "../../../common/Filter";
import { PageMargin } from "../..";
import { useTrade } from ".";
import { Explain } from "./Explain/Explain";
import { Markets } from "./Markets";

export const TradeInner: React.FC = () => {
  const { markets, assets, setAssets } = useTrade();
  return (
    <>
      <Explain />
      <div tw="border-b-2 border-stroke h-[296px] relative mt-[-296px] bg-secondary -z-10 w-full" />

      <PageMargin tw=" w-full max-w-4xl ">
        <div tw="flex flex-col gap-4 w-full ">
          <Display numMarkets={markets?.length} />
          <div tw=" gap-4 items-center ">
            <Filter assets={assets} setAssets={setAssets} />
            {/* <Sort /> */}
          </div>
          <Markets />
        </div>
      </PageMargin>
    </>
  );
};
