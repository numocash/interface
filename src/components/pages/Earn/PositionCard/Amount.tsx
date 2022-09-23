import type { IMarket } from "../../../../contexts/environment";
import { RowBetween } from "../../../common/RowBetween";
import { SubModule } from "../../../common/SubModule";
import { TokenIcon } from "../../../common/TokenIcon";

interface Props {
  market: IMarket;
}

export const Amounts: React.FC<Props> = ({ market }) => {
  return (
    <SubModule>
      <RowBetween tw="items-center">
        <div tw="items-center flex gap-2">
          <TokenIcon size={20} token={market.pair.speculativeToken} />
          <p tw="text-default">{market.pair.speculativeToken.symbol}</p>
        </div>
        <p tw="text-default font-semibold">10.002</p>
      </RowBetween>
      <RowBetween tw="items-center">
        <div tw="items-center flex gap-2">
          <TokenIcon size={20} token={market.pair.baseToken} />
          <p tw="text-default">{market.pair.baseToken.symbol}</p>
        </div>
        <p tw="text-default font-semibold">10.002</p>
      </RowBetween>
    </SubModule>
  );
};
