import { VerticalItem } from "../../common/VerticalItem";
import { useTradeDetails } from ".";

export const TotalStats: React.FC = () => {
  const { base } = useTradeDetails();

  // const longLendgine = useMemo(
  //   () => pickLongLendgines(lendgines, base)[0],
  //   [base, lendgines]
  // );
  // invariant(longLendgine);

  // const lendgineInfo = useLendgine(longLendgine);

  // const price = useMemo(
  //   () =>
  //     lendgineInfo.data ? numoenPrice(longLendgine, lendgineInfo.data) : null,
  //   [lendgineInfo.data, longLendgine]
  // );

  return (
    <div tw="flex justify-around w-full">
      <VerticalItem
        tw="items-center"
        label="Open interest"
        item={`100 ${base.symbol}`}
      />
      <VerticalItem
        tw="items-center"
        label="Total value locked"
        item={`100 ${base.symbol}`}
      />
    </div>
  );
};
