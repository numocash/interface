import { TokenIcon } from "../../common/TokenIcon";
import { useEarnDetails } from "./EarnDetailsInner";

export const Market: React.FC = () => {
  const { base, quote } = useEarnDetails();
  return (
    <div tw="flex w-full mb-4 ">
      <div tw="flex flex-col gap-2">
        <div tw="flex items-center gap-3">
          <div tw="flex items-center space-x-[-0.5rem]">
            <TokenIcon token={quote} size={32} />
            <TokenIcon token={base} size={32} />
          </div>
          <div tw="flex gap-1 font-semibold text-2xl text-black ">
            <p tw="">{quote.symbol}</p>
            <p>/</p>
            <p tw="">{base.symbol}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
