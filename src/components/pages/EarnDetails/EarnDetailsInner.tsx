import { TokenIcon } from "../../common/TokenIcon";
import { useEarnDetails } from ".";
import { BoundSelection } from "./BoundSelection";
import { History } from "./History/History";
import { Positions } from "./History/Positions/Positions";
import { Lendgines } from "./Lendgines";

export const EarnDetailsInner: React.FC = () => {
  const { base, quote } = useEarnDetails();
  return (
    <div tw="w-full flex flex-col max-w-3xl gap-4 col-span-2">
      <div tw="flex w-full mb-4">
        <div tw="flex flex-col gap-2">
          <div tw="flex items-center gap-3">
            <div tw="flex items-center space-x-[-0.5rem]">
              <TokenIcon token={quote} size={32} />
              <TokenIcon token={base} size={32} />
            </div>
            <div tw="flex gap-1 font-semibold text-lg text-default ">
              <p tw="">{quote.symbol}</p>
              <p>/</p>
              <p tw="">{base.symbol}</p>
            </div>
          </div>
        </div>
      </div>
      <p tw="text-sm font-semibold">Select a pool</p>
      <Lendgines />
      <BoundSelection />
      <div tw="border-b-2 border-gray-200" />

      <History />
      <Positions />
    </div>
  );
};
