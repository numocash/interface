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
      <div tw="flex flex-col gap-1 items-center">
        <p tw="font-semibold text-lg">100 {base.symbol}</p>
        <p tw="text-secondary text-sm">Open Interest</p>
      </div>
      <div tw="flex flex-col gap-1 items-center">
        <p tw="font-semibold text-lg">100 {base.symbol}</p>
        <p tw="text-secondary text-sm">Total Value Locked</p>
      </div>
    </div>
  );
};
