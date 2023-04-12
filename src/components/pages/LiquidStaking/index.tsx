import { LP } from "./LP";
import { Long } from "./Long";
import { Stats } from "./Stats";
import { PageMargin } from "../../layout";

export const LiquidStaking: React.FC = () => {
  return (
    <PageMargin tw="w-full pb-12 sm:pb-0 flex flex-col  gap-2 max-w-5xl">
      <div tw="w-full max-w-5xl rounded bg-white  border border-[#dfdfdf] pt-12 md:pt-20 px-6 pb-6 shadow mb-12">
        <div tw="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <p tw="font-bold text-2xl sm:text-4xl">Liquid Staking Boost</p>
          <div tw="gap-2 grid">
            <p tw="sm:text-lg text-[#8f8f8f] max-w-md">
              Boost staking yields by speculating on staking rewards.
            </p>
          </div>
        </div>
      </div>
      <Stats />
      <div tw="grid gap-10 sm:gap-4 sm:grid-cols-2 w-full mt-12">
        <Long />
        <LP />
      </div>
    </PageMargin>
  );
};
