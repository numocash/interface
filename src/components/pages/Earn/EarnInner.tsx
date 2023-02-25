import { NavLink } from "react-router-dom";

import { Button } from "../../common/Button";
import { Display } from "../../common/Display";
import { Filter } from "../../common/Filter";
import { useEarn } from ".";
import { Explain } from "./Explain/Explain";
import { Markets } from "./Markets";

export const EarnInner: React.FC = () => {
  const { markets, assets, setAssets } = useEarn();

  return (
    <div tw="grid w-full max-w-4xl flex-col gap-4">
      <Explain />
      <Display numMarkets={markets?.length} />
      <div tw="flex w-full justify-between gap-4">
        <Filter assets={assets} setAssets={setAssets} />
        {/* <Sort /> */}
        <NavLink to="/create/">
          <Button tw="py-2 px-4 rounded-lg text-lg" variant="primary">
            Create new market
          </Button>
        </NavLink>
      </div>
      <Markets />
    </div>
  );
};
