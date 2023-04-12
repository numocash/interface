import { Stats } from "./Stats";
import { useEnvironment } from "../../../contexts/useEnvironment";
import { TokenIcon } from "../../common/TokenIcon";
import { PageMargin } from "../../layout";

export const LiquidStaking: React.FC = () => {
  const environment = useEnvironment();
  return (
    <PageMargin tw="w-full pb-12 sm:pb-0 flex flex-col  gap-6 max-w-5xl">
      <div tw="w-full max-w-5xl rounded bg-white  border border-[#dfdfdf] pt-12 md:pt-20 px-6 pb-6 shadow mb-12">
        <div tw="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <p tw="font-bold text-2xl sm:text-4xl">Liquid Staking Boost</p>
          <div tw="gap-2 grid">
            <p tw="sm:text-lg text-[#8f8f8f] max-w-md">
              Boost staking yields by speculating on staking rewards.
            </p>
          </div>
          {/* TODO: add details section */}
        </div>
      </div>
      <TokenIcon
        token={environment.interface.liquidStaking!.lendgine.token1}
        size={48}
      />
      <Stats />
    </PageMargin>
  );
};
