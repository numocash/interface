import { useMemo } from "react";

import { useTradeDetails } from "./TradeDetailsInner";
import { pickLongLendgines, pickShortLendgines } from "../../../lib/lendgines";
import { nextHighestLendgine, nextLowestLendgine } from "../../../lib/price";

export const useNextLendgines = () => {
  const { lendgines, base, price } = useTradeDetails();
  return useMemo(() => {
    const longLendgines = pickLongLendgines(lendgines, base);
    const shortLendgines = pickShortLendgines(lendgines, base);
    const nextLongLendgine = nextHighestLendgine({
      price,
      lendgines: longLendgines,
    });
    const nextShortLendgine = nextHighestLendgine({
      price: price.invert(),
      lendgines: shortLendgines,
    });
    const secondLongLendgine = nextLowestLendgine({
      price,
      lendgines: longLendgines,
    });
    const secondShortLendgine = nextLowestLendgine({
      price: price.invert(),
      lendgines: shortLendgines,
    });

    return {
      longLendgine: nextLongLendgine ?? secondLongLendgine,
      shortLendgine: nextShortLendgine ?? secondShortLendgine,
    };
  }, [base, lendgines, price]);
};
