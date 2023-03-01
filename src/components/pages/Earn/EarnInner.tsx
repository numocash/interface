import { NavLink } from "react-router-dom";

import { Button } from "../../common/Button";
import { Display } from "../../common/Display";
import { Filter } from "../../common/Filter";
import { PageMargin } from "../../layout";
import { useEarn } from ".";
import { Explain } from "./Explain/Explain";
import { Markets } from "./Markets";

export const EarnInner: React.FC = () => {
  const { markets, assets, setAssets } = useEarn();

  return (
    <>
      <Explain />
      <div tw="border-b-2 border-stroke h-[280px] relative mt-[-280px] bg-secondary -z-20 w-full" />
      <PageMargin tw="mt-8 max-w-4xl w-full">
        <div tw="flex w-full flex-col gap-4 ">
          <Display numMarkets={markets?.length} />
          <div tw="flex w-full justify-end sm:justify-between gap-4 items-center">
            <Filter assets={assets} setAssets={setAssets} />
            {/* <Sort /> */}
            <NavLink to="/create/" tw="w-full sm:w-auto">
              <Button
                tw="py-2 px-4 rounded-lg text-lg sm:w-auto w-full justify-self-end"
                variant="primary"
              >
                Create new market
              </Button>
            </NavLink>
          </div>
          <Markets />
        </div>
      </PageMargin>
    </>
  );
};
