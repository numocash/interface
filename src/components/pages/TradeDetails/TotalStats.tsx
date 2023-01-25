import { useTradeDetails } from ".";

export const TotalStats: React.FC = () => {
  const { denom } = useTradeDetails();

  return (
    <div tw="flex justify-around w-full">
      <div tw="flex flex-col gap-1 items-center">
        <p tw="font-semibold text-lg">100 {denom.symbol}</p>
        <p tw="text-secondary text-sm">Open Interest</p>
      </div>
      <div tw="flex flex-col gap-1 items-center">
        <p tw="font-semibold text-lg">100 {denom.symbol}</p>
        <p tw="text-secondary text-sm">Volume</p>
      </div>
    </div>
  );
};
