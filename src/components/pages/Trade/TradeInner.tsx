import { PageMargin } from "../../layout";
import { Markets } from "./Markets";

export const TradeInner: React.FC = () => {
  return (
    <PageMargin tw="w-full pb-12 sm:pb-0 flex flex-col  gap-2">
      <div tw="w-full max-w-5xl rounded bg-white  border border-gray-200 items-center pt-12 md:pt-20 px-6 pb-6 shadow mb-12">
        <div tw="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <p tw="font-bold text-4xl">Trade Power Tokens</p>
          <p tw=" text-lg text-[#8f8f8f] max-w-md">
            Power tokens maintain constant leverage, through a novel mechanism
            of borrowing AMM shares.
          </p>
        </div>
      </div>
      <Markets />
    </PageMargin>
  );
};
