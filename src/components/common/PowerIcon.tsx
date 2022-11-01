import type { IMarket } from "../../contexts/environment";
import power from "./images/power.png";
import { TokenIcon } from "./TokenIcon";

interface Props {
  market: IMarket;
}

export const PowerIcon: React.FC<Props> = ({ market }: Props) => {
  return (
    <div tw="flex items-center space-x-2">
      <div tw="flex flex-col">
        <div tw="flex items-center space-x-2">
          <TokenIcon size={24} token={market.pair.speculativeToken} />
          <div tw="mr-1 space-y-1">
            <div tw="text-lg font-semibold leading-none">
              {market.pair.speculativeToken.symbol}
            </div>
          </div>
        </div>
        <div tw="border border-action m-1.5" />
        <div tw="flex items-center space-x-2">
          <TokenIcon size={24} token={market.pair.baseToken} />
          <div tw="mr-1 space-y-1">
            <div tw="text-lg font-semibold leading-none">
              {market.pair.baseToken.symbol}
            </div>
          </div>
        </div>
      </div>
      <img tw="h-[50px] w-[65px]" src={power} alt={`power`} />
    </div>
  );
};
