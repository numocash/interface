import type { IMarket } from "../../contexts/environment";
import { ChartIcons } from "./ChartIcons";
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
          <div tw=" space-y-1">
            <div tw="text-lg font-semibold leading-none">
              {market.pair.speculativeToken.symbol}+
            </div>
          </div>
          <img tw="h-[50px] w-[65px]" src={power} alt={`power`} />
        </div>
        <div tw="flex  gap-1">
          <ChartIcons chart="up" token={market.pair.speculativeToken} text />
          <ChartIcons chart="down" token={market.pair.baseToken} text />
        </div>
      </div>
    </div>
  );
};
